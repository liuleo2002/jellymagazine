import { type User, type InsertUser, type Article, type InsertArticle, type SelectWebsiteContent, type InsertWebsiteContent } from "@shared/schema";
import { MemStorage } from "./memStorage";
import { DbStorage } from "./dbStorage";

export interface GetArticlesParams {
  search?: string;
  category?: string;
  status?: string;
  authorId?: string;
  sort?: string;
  limit: number;
  offset: number;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(userId: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  updateUserRole(userId: string, role: string): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  getArticleById(id: string): Promise<(Article & { author: User }) | undefined>;
  getFeaturedArticle(): Promise<(Article & { author: User }) | undefined>;
  getArticles(params: GetArticlesParams): Promise<(Article & { author: User })[]>;
  getAllArticles(): Promise<Article[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: string, article: Partial<InsertArticle>): Promise<Article>;
  deleteArticle(id: string): Promise<void>;
  
  getAuthorsWithArticleCount(): Promise<(User & { articleCount: number })[]>;
  getDashboardStats(): Promise<{
    totalUsers: number;
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
  }>;

  // Website content management
  getWebsiteContent(): Promise<SelectWebsiteContent[]>;
  getWebsiteContentBySection(section: string): Promise<SelectWebsiteContent[]>;
  updateWebsiteContent(section: string, key: string, value: string): Promise<SelectWebsiteContent>;
  initializeDefaultContent(): Promise<void>;
}

// Initialize storage with fallback to in-memory
let storageInstance: IStorage | null = null;

export async function getStorage(): Promise<IStorage> {
  if (!storageInstance) {
    // For now, use memory storage due to database connection issues
    console.log("Using in-memory storage");
    storageInstance = new MemStorage();
  }
  return storageInstance!;
}

// Create storage instance
export const storage = new MemStorage();