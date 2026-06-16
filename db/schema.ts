import {
  mysqlTable,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  json,
} from "drizzle-orm/mysql-core";

// Room uploads — stores original uploaded room photos
export const roomUploads = mysqlTable("room_uploads", {
  id: serial("id").primaryKey(),
  roomType: varchar("room_type", { length: 50 }).notNull(), // bedroom, living-room, etc.
  designStyle: varchar("design_style", { length: 50 }).notNull(), // modern, scandinavian, etc.
  budgetRange: varchar("budget_range", { length: 50 }), // under-10k, 10k-25k, etc.
  originalImage: text("original_image").notNull(), // base64 or URL
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Makeover results — stores AI-generated redesigns
export const makeoverResults = mysqlTable("makeover_results", {
  id: serial("id").primaryKey(),
  uploadId: bigint("upload_id", { mode: "number", unsigned: true }).notNull(),
  generatedImage: text("generated_image").notNull(), // URL to generated image
  colorPalette: json("color_palette").$type<{ name: string; hex: string }[]>(),
  pinterestImage: text("pinterest_image"), // URL to pinterest composite
  totalBudget: bigint("total_budget", { mode: "number", unsigned: true }).default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Furniture recommendations per makeover
export const furnitureItems = mysqlTable("furniture_items", {
  id: serial("id").primaryKey(),
  resultId: bigint("result_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  price: bigint("price", { mode: "number", unsigned: true }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  affiliateLink: text("affiliate_link").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Gallery items — curated style showcases with weekly rotation
export const galleryItems = mysqlTable("gallery_items", {
  id: serial("id").primaryKey(),
  caption: varchar("caption", { length: 255 }).notNull(),
  description: text("description"),
  image: text("image").notNull(), // image path
  style: varchar("style", { length: 100 }).notNull(), // e.g. "Farmhouse Kitchen"
  weekSlot: varchar("week_slot", { length: 20 }).notNull(), // "W1", "W2", "W3", "W4"
  isActive: bigint("is_active", { mode: "number", unsigned: true }).default(1),
  products: json("products").$type<
    { name: string; price: number; link: string; category: string }[]
  >(),
  changes: json("changes").$type<{ title: string; description: string }[]>(),
  colors: json("colors").$type<{ name: string; hex: string }[]>(),
  totalBudget: bigint("total_budget", { mode: "number", unsigned: true }).default(0),
  timeEstimate: varchar("time_estimate", { length: 50 }),
  difficulty: varchar("difficulty", { length: 20 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Contact/leads — users interested in the service
export const contacts = mysqlTable("contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Trend data — cached trend scores from external APIs
export const trends = mysqlTable("trends", {
  id: serial("id").primaryKey(),
  keyword: varchar("keyword", { length: 200 }).notNull(),
  source: varchar("source", { length: 50 }).notNull(), // "reddit", "google", "unsplash"
  score: bigint("score", { mode: "number", unsigned: true }).default(0),
  mentions: bigint("mentions", { mode: "number", unsigned: true }).default(0),
  growthRate: bigint("growth_rate", { mode: "number", unsigned: true }).default(0),
  roomCategory: varchar("room_category", { length: 50 }),
  styleTag: varchar("style_tag", { length: 100 }),
  sampleImage: text("sample_image"), // URL from Unsplash
  data: json("data").$type<Record<string, unknown>>(), // raw API response
  fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
});
