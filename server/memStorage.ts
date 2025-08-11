import type { User, Article, InsertUser, InsertArticle } from "@shared/schema";
import { randomUUID } from "crypto";
import type { IStorage, ArticleWithAuthor, GetArticlesParams } from "./storage";

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private articles: Map<string, Article>;

  constructor() {
    this.users = new Map();
    this.articles = new Map();
    this.seedData();
  }

  private async seedData() {
    // Create default owner user for testing
    const ownerUser: User = {
      id: "owner-1",
      name: "Jelly Owner",
      email: "owner@jelly.com",
      password: await import('bcrypt').then(bcrypt => bcrypt.hash("password123", 10)),
      role: "owner",
      bio: "Founder of Jelly Magazine - spreading colorful creativity!",
      profilePictureUrl: null,
      createdAt: new Date(),
    };
    this.users.set(ownerUser.id, ownerUser);

    // Create sample editor user
    const editorUser: User = {
      id: "editor-1",
      name: "Creative Editor",
      email: "editor@jelly.com",
      password: await import('bcrypt').then(bcrypt => bcrypt.hash("password123", 10)),
      role: "editor",
      bio: "Passionate about design trends and colorful content!",
      profilePictureUrl: null,
      createdAt: new Date(),
    };
    this.users.set(editorUser.id, editorUser);

    // Create sample articles
    const sampleArticle1: Article = {
      id: "article-1",
      title: "The Power of Color in Modern Design",
      content: `<h2>Welcome to the Colorful World of Design!</h2>
      <p>Color is one of the most powerful tools in a designer's arsenal. It can evoke emotions, create atmosphere, and guide user attention in ways that few other design elements can match.</p>
      
      <h3>Understanding Color Psychology</h3>
      <p>Different colors trigger different emotional responses. Warm colors like red, orange, and yellow tend to be energizing and exciting, while cool colors like blue, green, and purple are calming and professional.</p>
      
      <h3>Creating Effective Color Palettes</h3>
      <p>The key to great color design is balance. Start with a primary color that represents your brand or message, then build a palette that supports and enhances that foundation.</p>`,
      excerpt: "Discover how color psychology can transform your design work and create more engaging user experiences.",
      status: "published",
      authorId: editorUser.id,
      imageUrl: null,
      category: "design",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      publishDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    };
    this.articles.set(sampleArticle1.id, sampleArticle1);

    const sampleArticle2: Article = {
      id: "article-2", 
      title: "Mobile-First Design: Creating Responsive Experiences",
      content: `<h2>Designing for Mobile in 2024</h2>
      <p>With mobile devices accounting for over 60% of web traffic, mobile-first design isn't just a trend—it's essential for success.</p>
      
      <h3>Key Principles of Mobile Design</h3>
      <ul>
        <li>Touch-friendly interface elements</li>
        <li>Optimized loading speeds</li>
        <li>Intuitive navigation patterns</li>
        <li>Readable typography at all screen sizes</li>
      </ul>
      
      <h3>Tools and Techniques</h3>
      <p>Modern CSS frameworks like Tailwind CSS make responsive design easier than ever. Use breakpoint-based utility classes to create layouts that adapt beautifully to any screen size.</p>`,
      excerpt: "Learn the essential principles of mobile-first design and create experiences that work perfectly on every device.",
      status: "published",
      authorId: ownerUser.id,
      imageUrl: null,
      category: "mobile",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      publishDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    };
    this.articles.set(sampleArticle2.id, sampleArticle2);

    const draftArticle: Article = {
      id: "article-3",
      title: "Animation Trends for 2024",
      content: `<h2>The Future of Web Animation</h2>
      <p>This article is still being written... Coming soon with exciting animation trends!</p>`,
      excerpt: "Explore the latest animation trends that will define digital experiences in 2024.",
      status: "draft",
      authorId: editorUser.id,
      imageUrl: null,
      category: "animation",
      createdAt: new Date(),
      updatedAt: new Date(),
      publishDate: null,
    };
    this.articles.set(draftArticle.id, draftArticle);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || 'reader',
      bio: insertUser.bio || null,
      profilePictureUrl: insertUser.profilePictureUrl || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = { ...user, role: role as any };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    });
  }

  async getArticleById(id: string): Promise<ArticleWithAuthor | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;

    const author = this.users.get(article.authorId);
    if (!author) return undefined;

    const { password, ...authorWithoutPassword } = author;
    return {
      ...article,
      author: authorWithoutPassword as User,
    };
  }

  async getArticles(params: GetArticlesParams): Promise<ArticleWithAuthor[]> {
    let filteredArticles = Array.from(this.articles.values());

    // Apply filters
    if (params.status) {
      filteredArticles = filteredArticles.filter(article => article.status === params.status);
    }

    if (params.category) {
      filteredArticles = filteredArticles.filter(article => article.category === params.category);
    }

    if (params.authorId) {
      filteredArticles = filteredArticles.filter(article => article.authorId === params.authorId);
    }

    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredArticles = filteredArticles.filter(article => 
        article.title.toLowerCase().includes(searchLower) ||
        article.content.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    switch (params.sort) {
      case 'oldest':
        filteredArticles.sort((a, b) => new Date(a.publishDate || a.createdAt).getTime() - new Date(b.publishDate || b.createdAt).getTime());
        break;
      case 'title':
        filteredArticles.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default: // newest
        filteredArticles.sort((a, b) => new Date(b.publishDate || b.createdAt).getTime() - new Date(a.publishDate || a.createdAt).getTime());
    }

    // Apply pagination
    const paginatedArticles = filteredArticles.slice(params.offset, params.offset + params.limit);

    const articlesWithAuthors: ArticleWithAuthor[] = [];
    for (const article of paginatedArticles) {
      const author = this.users.get(article.authorId);
      if (author) {
        const { password, ...authorWithoutPassword } = author;
        articlesWithAuthors.push({
          ...article,
          author: authorWithoutPassword as User,
        });
      }
    }

    return articlesWithAuthors;
  }

  async getAllArticles(): Promise<Article[]> {
    return Array.from(this.articles.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = randomUUID();
    const now = new Date();
    const article: Article = {
      ...insertArticle,
      id,
      status: insertArticle.status || 'draft',
      imageUrl: insertArticle.imageUrl || null,
      category: insertArticle.category || null,
      createdAt: now,
      updatedAt: now,
      publishDate: insertArticle.status === 'published' ? now : null,
    };
    this.articles.set(id, article);
    return article;
  }

  async updateArticle(id: string, updateData: Partial<InsertArticle>): Promise<Article> {
    const article = this.articles.get(id);
    if (!article) {
      throw new Error("Article not found");
    }

    const updatedArticle: Article = {
      ...article,
      ...updateData,
      updatedAt: new Date(),
      publishDate: updateData.status === 'published' && article.status !== 'published' 
        ? new Date() 
        : article.publishDate,
    };

    this.articles.set(id, updatedArticle);
    return updatedArticle;
  }

  async deleteArticle(id: string): Promise<void> {
    this.articles.delete(id);
  }

  async getFeaturedArticle(): Promise<ArticleWithAuthor | undefined> {
    const publishedArticles = Array.from(this.articles.values())
      .filter(article => article.status === 'published')
      .sort((a, b) => new Date(b.publishDate!).getTime() - new Date(a.publishDate!).getTime());

    if (publishedArticles.length === 0) return undefined;

    const featured = publishedArticles[0];
    const author = this.users.get(featured.authorId);
    if (!author) return undefined;

    const { password, ...authorWithoutPassword } = author;
    return {
      ...featured,
      author: authorWithoutPassword as User,
    };
  }

  async getAuthorsWithArticleCount(): Promise<(User & { articleCount: number })[]> {
    const authors = Array.from(this.users.values()).filter(user => user.role !== 'reader');
    const publishedArticles = Array.from(this.articles.values()).filter(article => article.status === 'published');

    return authors.map(author => {
      const { password, ...authorWithoutPassword } = author;
      const articleCount = publishedArticles.filter(article => article.authorId === author.id).length;
      return {
        ...authorWithoutPassword as User,
        articleCount,
      };
    }).sort((a, b) => b.articleCount - a.articleCount);
  }

  async getDashboardStats(): Promise<{
    totalUsers: number;
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
  }> {
    const allArticles = Array.from(this.articles.values());
    return {
      totalUsers: this.users.size,
      totalArticles: allArticles.length,
      publishedArticles: allArticles.filter(article => article.status === 'published').length,
      draftArticles: allArticles.filter(article => article.status === 'draft').length,
    };
  }
}