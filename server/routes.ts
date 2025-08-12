import type { Express } from "express";
import { createServer, type Server } from "http";
import { getStorage } from "./storage";
import { setupAuth, requireAuth, requireRole } from "./auth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { 
  loginSchema, 
  signupSchema, 
  insertArticleSchema, 
  contactSchema, 
  updateRoleSchema 
} from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware
  await setupAuth(app);
  
  // Initialize storage for database connection
  const storageInstance = await getStorage();
  console.log("Storage initialized successfully");

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storageInstance.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      (req.session as any).userId = user.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { name, email, password, masterCode } = signupSchema.parse(req.body);
      
      const existingUser = await storageInstance.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Check master code for owner role
      const role = masterCode === process.env.MASTER_CODE ? 'owner' : 'reader';
      
      const user = await storageInstance.createUser({
        name,
        email,
        password: hashedPassword,
        role: role as any,
      });

      // Set session
      (req.session as any).userId = user.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    const userId = (req.session as any).userId;
    const user = await storageInstance.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Article routes
  app.get("/api/articles/featured", async (req, res) => {
    const articles = await storageInstance.getFeaturedArticle();
    res.json(articles);
  });

  app.get("/api/articles/recent", async (req, res) => {
    console.log('Getting recent articles');
    const articles = await storageInstance.getArticles({
      status: 'published',
      sort: 'newest',
      limit: 6,
      offset: 0,
    });
    console.log('Found recent articles:', articles.length);
    res.json(articles);
  });

  app.get("/api/articles", async (req, res) => {
    const { search, category, sort, page = 1 } = req.query;
    const limit = 9;
    const offset = (parseInt(page as string) - 1) * limit;
    
    console.log('Getting articles with params:', { search, category, sort, page, limit, offset });
    
    const articles = await storageInstance.getArticles({
      search: search as string,
      category: category as string,
      sort: sort as string,
      status: 'published',
      limit,
      offset,
    });
    
    console.log('Found articles:', articles.length);
    res.json(articles);
  });

  app.get("/api/articles/all", requireRole(['owner', 'editor']), async (req, res) => {
    const articles = await storageInstance.getAllArticles();
    res.json(articles);
  });

  app.get("/api/articles/:id", async (req, res) => {
    const article = await storageInstance.getArticleById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.json(article);
  });

  app.post("/api/articles", requireRole(['owner', 'editor', 'contributor']), async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const data = insertArticleSchema.parse(req.body);
      
      const article = await storageInstance.createArticle({
        ...data,
        authorId: userId,
      });
      
      res.json(article);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.put("/api/articles/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storageInstance.getUser(userId);
      const article = await storageInstance.getArticleById(req.params.id);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      // Check permissions
      if (article.authorId !== userId && !['owner', 'editor'].includes(user!.role)) {
        return res.status(403).json({ message: "Permission denied" });
      }

      const data = insertArticleSchema.parse(req.body);
      const updatedArticle = await storageInstance.updateArticle(req.params.id, data);
      
      res.json(updatedArticle);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.delete("/api/articles/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storageInstance.getUser(userId);
      const article = await storageInstance.getArticleById(req.params.id);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      // Check permissions
      if (article.authorId !== userId && user!.role !== 'owner') {
        return res.status(403).json({ message: "Permission denied" });
      }

      await storageInstance.deleteArticle(req.params.id);
      res.json({ message: "Article deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  // Author routes
  app.get("/api/authors", async (req, res) => {
    const authors = await storageInstance.getAuthorsWithArticleCount();
    res.json(authors);
  });

  // User management routes
  app.get("/api/users", requireRole(['owner']), async (req, res) => {
    const users = await storageInstance.getAllUsers();
    res.json(users);
  });

  app.put("/api/users/role", requireRole(['owner']), async (req, res) => {
    try {
      const { userId, role } = updateRoleSchema.parse(req.body);
      const updatedUser = await storageInstance.updateUserRole(userId, role);
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", requireRole(['owner']), async (req, res) => {
    const stats = await storageInstance.getDashboardStats();
    res.json(stats);
  });

  // Contact form
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, message } = contactSchema.parse(req.body);
      
      // In a real app, you would send an email here
      console.log("Contact form submission:", { name, email, message });
      
      res.json({ message: "Message sent successfully" });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Website content management routes (owner only)
  app.get("/api/content", requireRole(['owner']), async (req, res) => {
    try {
      const content = await storageInstance.getWebsiteContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  app.get("/api/content/:section", requireRole(['owner']), async (req, res) => {
    try {
      const content = await storageInstance.getWebsiteContentBySection(req.params.section);
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  app.get("/api/content/:section/:key", async (req, res) => {
    try {
      const content = await storageInstance.getWebsiteContentBySection(req.params.section);
      const item = content.find(c => c.key === req.params.key);
      
      if (!item) {
        return res.status(404).json({ error: "Content not found" });
      }
      
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  app.put("/api/content/:section/:key", requireRole(['owner']), async (req, res) => {
    try {
      const { value } = req.body;
      const updated = await storageInstance.updateWebsiteContent(
        req.params.section,
        req.params.key,
        value
      );
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update content" });
    }
  });

  // Profile management routes
  app.put("/api/users/:userId/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.params.userId;
      const currentUser = (req as any).user;
      
      // Users can only edit their own profile, unless they're the owner
      if (currentUser.id !== userId && currentUser.role !== 'owner') {
        return res.status(403).json({ error: "Not authorized to edit this profile" });
      }
      
      const { name, bio, profilePictureUrl } = req.body;
      
      // Update user profile
      const updatedUser = await storageInstance.updateUser(userId, {
        name,
        bio,
        profilePictureUrl,
      });
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.put("/api/profile-images", requireAuth, async (req, res) => {
    try {
      const { profileImageURL } = req.body;
      const userId = (req as any).user.id;
      
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        profileImageURL,
        {
          owner: userId,
          visibility: "public", // Profile images should be publicly accessible
        }
      );
      
      res.json({ objectPath });
    } catch (error) {
      console.error("Error setting profile image:", error);
      res.status(500).json({ error: "Failed to process profile image" });
    }
  });

  // Object storage routes
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", requireAuth, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });



  const httpServer = createServer(app);
  return httpServer;
}
