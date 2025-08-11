import { type User, type InsertUser, type Article, type InsertArticle, type ArticleWithAuthor, type SelectWebsiteContent, type InsertWebsiteContent } from "@shared/schema";
import { MemStorage } from "./memStorage";

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
  
  getArticleById(id: string): Promise<ArticleWithAuthor | undefined>;
  getFeaturedArticle(): Promise<ArticleWithAuthor | undefined>;
  getArticles(params: GetArticlesParams): Promise<ArticleWithAuthor[]>;
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
    // For now, use in-memory storage (can be enhanced later for database)
    storageInstance = new MemStorage();
  }
  return storageInstance;
}

// Synchronous storage for immediate use
export const storage = new MemStorage();