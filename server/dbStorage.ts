import { eq, desc, sql, like, and, ne } from 'drizzle-orm';
import { getDb } from './db';
import { users, articles, websiteContent, type User, type Article, type InsertUser, type InsertArticle, type SelectWebsiteContent, type InsertWebsiteContent, defaultWebsiteContent } from '@shared/schema';
import type { IStorage, GetArticlesParams } from './storage';

export class DbStorage implements IStorage {
  private db = getDb();

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const [user] = await this.db
      .update(users)
      .set({ role: role as any })
      .where(eq(users.id, userId))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }

  async updateUser(userId: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await this.db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await this.db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      bio: users.bio,
      profilePictureUrl: users.profilePictureUrl,
      createdAt: users.createdAt,
      password: sql<string>`''`.as('password') // Exclude password from results
    }).from(users);
  }

  async getArticleById(id: string): Promise<(Article & { author: User }) | undefined> {
    const result = await this.db
      .select({
        article: articles,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          bio: users.bio,
          profilePictureUrl: users.profilePictureUrl,
          createdAt: users.createdAt,
          password: sql`''`.as('password')
        }
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(eq(articles.id, id))
      .limit(1);

    if (!result[0] || !result[0].author) return undefined;

    return {
      ...result[0].article,
      author: result[0].author
    };
  }

  async getArticles(params: GetArticlesParams): Promise<(Article & { author: User })[]> {
    let query = this.db
      .select({
        article: articles,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          bio: users.bio,
          profilePictureUrl: users.profilePictureUrl,
          createdAt: users.createdAt,
          password: sql`''`.as('password')
        }
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id));

    // Apply filters
    const conditions = [];
    
    if (params.status) {
      conditions.push(eq(articles.status, params.status as any));
    }
    
    if (params.category) {
      conditions.push(eq(articles.category, params.category));
    }
    
    if (params.authorId) {
      conditions.push(eq(articles.authorId, params.authorId));
    }
    
    if (params.search) {
      conditions.push(
        sql`${articles.title} ILIKE ${`%${params.search}%`} OR ${articles.content} ILIKE ${`%${params.search}%`}`
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    switch (params.sort) {
      case 'oldest':
        query = query.orderBy(articles.createdAt);
        break;
      case 'title':
        query = query.orderBy(articles.title);
        break;
      default: // newest
        query = query.orderBy(desc(articles.createdAt));
    }

    // Apply pagination
    query = query.limit(params.limit).offset(params.offset);

    const result = await query;

    return result
      .filter(row => row.author)
      .map(row => ({
        ...row.article,
        author: row.author!
      }));
  }

  async getAllArticles(): Promise<Article[]> {
    return await this.db.select().from(articles).orderBy(desc(articles.createdAt));
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const [article] = await this.db.insert(articles).values({
      ...insertArticle,
      publishDate: insertArticle.status === 'published' ? new Date() : null
    }).returning();
    return article;
  }

  async updateArticle(id: string, updateData: Partial<InsertArticle>): Promise<Article> {
    const existingArticle = await this.db.select().from(articles).where(eq(articles.id, id)).limit(1);
    if (!existingArticle[0]) {
      throw new Error("Article not found");
    }

    const [article] = await this.db
      .update(articles)
      .set({
        ...updateData,
        updatedAt: new Date(),
        publishDate: updateData.status === 'published' && existingArticle[0].status !== 'published' 
          ? new Date() 
          : existingArticle[0].publishDate
      })
      .where(eq(articles.id, id))
      .returning();

    return article;
  }

  async deleteArticle(id: string): Promise<void> {
    await this.db.delete(articles).where(eq(articles.id, id));
  }

  async getFeaturedArticle(): Promise<(Article & { author: User }) | undefined> {
    const result = await this.db
      .select({
        article: articles,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          bio: users.bio,
          profilePictureUrl: users.profilePictureUrl,
          createdAt: users.createdAt,
          password: sql`''`.as('password')
        }
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(eq(articles.status, 'published'))
      .orderBy(desc(articles.createdAt))
      .limit(1);

    if (!result[0] || !result[0].author) return undefined;

    return {
      ...result[0].article,
      author: result[0].author
    };
  }

  async getAuthorsWithArticleCount(): Promise<(User & { articleCount: number })[]> {
    const result = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        bio: users.bio,
        profilePictureUrl: users.profilePictureUrl,
        createdAt: users.createdAt,
        password: sql`''`.as('password'),
        articleCount: sql<number>`cast(count(${articles.id}) as int)`
      })
      .from(users)
      .leftJoin(articles, and(eq(users.id, articles.authorId), eq(articles.status, 'published')))
      .where(ne(users.role, 'reader'))
      .groupBy(users.id)
      .orderBy(desc(sql`count(${articles.id})`));

    return result.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      bio: row.bio,
      profilePictureUrl: row.profilePictureUrl,
      createdAt: row.createdAt,
      password: row.password,
      articleCount: row.articleCount
    }));
  }

  async getDashboardStats(): Promise<{
    totalUsers: number;
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
  }> {
    const [userCount] = await this.db.select({ count: sql<number>`cast(count(*) as int)` }).from(users);
    const [totalArticles] = await this.db.select({ count: sql<number>`cast(count(*) as int)` }).from(articles);
    const [publishedArticles] = await this.db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(articles)
      .where(eq(articles.status, 'published'));
    const [draftArticles] = await this.db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(articles)
      .where(eq(articles.status, 'draft'));

    return {
      totalUsers: userCount.count,
      totalArticles: totalArticles.count,
      publishedArticles: publishedArticles.count,
      draftArticles: draftArticles.count,
    };
  }

  async getWebsiteContent(): Promise<SelectWebsiteContent[]> {
    return await this.db.select().from(websiteContent).orderBy(websiteContent.section, websiteContent.key);
  }

  async getWebsiteContentBySection(section: string): Promise<SelectWebsiteContent[]> {
    return await this.db.select().from(websiteContent).where(eq(websiteContent.section, section));
  }

  async updateWebsiteContent(section: string, key: string, value: string): Promise<SelectWebsiteContent> {
    // Try to update existing content
    const [existing] = await this.db
      .update(websiteContent)
      .set({ value, updatedAt: new Date() })
      .where(and(eq(websiteContent.section, section), eq(websiteContent.key, key)))
      .returning();

    if (existing) {
      return existing;
    }

    // Create new content if it doesn't exist
    const [newContent] = await this.db
      .insert(websiteContent)
      .values({ section, key, value, type: 'text' })
      .returning();

    return newContent;
  }

  async initializeDefaultContent(): Promise<void> {
    // Check if content already exists
    const existing = await this.db.select().from(websiteContent).limit(1);
    
    if (existing.length === 0) {
      // Insert default content
      await this.db.insert(websiteContent).values(defaultWebsiteContent);
      console.log('✅ Default website content initialized');
    }
  }
}