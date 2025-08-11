import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '@shared/schema';

let db: ReturnType<typeof drizzle>;

export function getDb() {
  if (!db) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    const sql = neon(databaseUrl);
    db = drizzle(sql, { schema });
  }
  return db;
}

export async function initializeDatabase() {
  try {
    const database = getDb();
    
    // Test the connection
    await database.select().from(schema.users).limit(1);
    console.log('✅ Database connected successfully');
    
    // Create initial seed data if no users exist
    const existingUsers = await database.select().from(schema.users).limit(1);
    if (existingUsers.length === 0) {
      console.log('🌱 Creating seed data...');
      await createSeedData(database);
    }
    
    return database;
  } catch (error) {
    console.log('⚠️ Database connection failed, using in-memory storage');
    console.error('Database error:', error);
    return null;
  }
}

async function createSeedData(database: ReturnType<typeof drizzle>) {
  const bcrypt = await import('bcrypt');
  
  // Create owner user
  const [ownerUser] = await database.insert(schema.users).values({
    name: "Jelly Owner",
    email: "owner@jelly.com", 
    password: await bcrypt.hash("password123", 10),
    role: "owner",
    bio: "Founder of Jelly Magazine - spreading colorful creativity!",
  }).returning();

  // Create editor user
  const [editorUser] = await database.insert(schema.users).values({
    name: "Creative Editor",
    email: "editor@jelly.com",
    password: await bcrypt.hash("password123", 10), 
    role: "editor",
    bio: "Passionate about design trends and colorful content!",
  }).returning();

  // Create sample articles
  await database.insert(schema.articles).values([
    {
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
      category: "design",
      publishDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
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
      category: "mobile",
      publishDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Animation Trends for 2024",
      content: `<h2>The Future of Web Animation</h2>
      <p>This article is still being written... Coming soon with exciting animation trends!</p>`,
      excerpt: "Explore the latest animation trends that will define digital experiences in 2024.",
      status: "draft",
      authorId: editorUser.id,
      category: "animation",
    }
  ]);

  console.log('✅ Seed data created successfully');
}