import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Website content management for editable site elements
export const websiteContent = pgTable("website_content", {
  id: uuid("id").primaryKey().defaultRandom(),
  section: text("section").notNull(), // e.g., 'hero', 'about', 'footer'
  key: text("key").notNull(), // e.g., 'title', 'subtitle', 'description'
  value: text("value").notNull(),
  type: text("type").notNull().default("text"), // 'text', 'html', 'image', 'link'
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schemas for website content
export const insertWebsiteContentSchema = createInsertSchema(websiteContent).omit({
  id: true,
  updatedAt: true,
});

export const selectWebsiteContentSchema = createSelectSchema(websiteContent);

export type InsertWebsiteContent = z.infer<typeof insertWebsiteContentSchema>;
export type SelectWebsiteContent = z.infer<typeof selectWebsiteContentSchema>;

// Default content structure for initialization
export const defaultWebsiteContent: Omit<InsertWebsiteContent, 'id' | 'updatedAt'>[] = [
  // Hero section
  { section: 'hero', key: 'title', value: 'Welcome to Jelly', type: 'text' },
  { section: 'hero', key: 'subtitle', value: 'A colorful magazine for creative minds', type: 'text' },
  { section: 'hero', key: 'description', value: 'Discover inspiring stories, vibrant designs, and creative insights that spark imagination.', type: 'text' },
  { section: 'hero', key: 'ctaText', value: 'Start Reading', type: 'text' },
  { section: 'hero', key: 'ctaLink', value: '/archive', type: 'link' },
  
  // Articles section
  { section: 'articles', key: 'title', value: 'Latest Stories', type: 'text' },
  { section: 'articles', key: 'subtitle', value: 'Fresh content delivered weekly, bursting with creativity and inspiration!', type: 'text' },

  // About section
  { section: 'about', key: 'title', value: 'About Jelly', type: 'text' },
  { section: 'about', key: 'description', value: 'Jelly is where creativity meets inspiration. We curate colorful content that celebrates design, innovation, and the joy of creative expression.', type: 'html' },
  
  // Footer
  { section: 'footer', key: 'copyright', value: '© 2024 Jelly Magazine. All rights reserved.', type: 'text' },
  { section: 'footer', key: 'tagline', value: 'Stay colorful, stay creative', type: 'text' },
  
  // Navigation
  { section: 'nav', key: 'logo', value: 'Jelly', type: 'text' },
  
  // Authors page
  { section: 'authors', key: 'title', value: 'Meet Our Authors', type: 'text' },
  { section: 'authors', key: 'subtitle', value: 'The creative minds behind our colorful content', type: 'text' },

  // Contact page
  { section: 'contact', key: 'title', value: 'Get in Touch', type: 'text' },
  { section: 'contact', key: 'description', value: 'We\'d love to hear from you! Send us your thoughts, ideas, or collaboration proposals.', type: 'html' },
];