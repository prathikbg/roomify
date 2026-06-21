import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { galleryItems } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

// Helper: get current week of the month (1-4)
function getCurrentWeekSlot(): string {
  const now = new Date();
  const day = now.getDate();
  if (day <= 7) return "W1";
  if (day <= 14) return "W2";
  if (day <= 21) return "W3";
  return "W4";
}

export const galleryRouter = createRouter({
  // Get ALL gallery items (default view)
  listAll: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(galleryItems)
      .where(eq(galleryItems.isActive, 1))
      .orderBy(galleryItems.weekSlot, galleryItems.createdAt);
  }),

  // Get gallery items for a specific week slot
  listByWeek: publicQuery
    .input(
      z.object({
        weekSlot: z.string().optional(), // "W1", "W2", "W3", "W4" or omit for current week
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const slot = input?.weekSlot ?? getCurrentWeekSlot();

      const items = await db
        .select()
        .from(galleryItems)
        .where(
          and(
            eq(galleryItems.weekSlot, slot),
            eq(galleryItems.isActive, 1)
          )
        )
        .orderBy(galleryItems.createdAt);

      return { items, weekSlot: slot };
    }),

  // Get trending styles (highest budget = most popular/trending)
  trending: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(galleryItems)
      .where(eq(galleryItems.isActive, 1))
      .orderBy(desc(galleryItems.totalBudget))
      .limit(6);
  }),

  // Get all unique week slots available
  getWeekSlots: publicQuery.query(async () => {
    const db = getDb();
    const items = await db
      .select({ weekSlot: galleryItems.weekSlot })
      .from(galleryItems)
      .where(eq(galleryItems.isActive, 1))
      .groupBy(galleryItems.weekSlot);

    return items.map((i) => i.weekSlot);
  }),

  // Get single gallery item by ID
  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(galleryItems)
        .where(eq(galleryItems.id, input.id))
        .limit(1);
      return result[0] ?? null;
    }),

  // Admin: create gallery item
  create: publicQuery
    .input(
      z.object({
        caption: z.string().min(1),
        description: z.string(),
        image: z.string().min(1),
        style: z.string().min(1),
        weekSlot: z.string().min(1),
        products: z.array(
          z.object({
            name: z.string(),
            price: z.number(),
            link: z.string(),
            category: z.string(),
          })
        ),
        changes: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
          })
        ),
        colors: z.array(
          z.object({
            name: z.string(),
            hex: z.string(),
          })
        ),
        totalBudget: z.number(),
        timeEstimate: z.string(),
        difficulty: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [item] = await db.insert(galleryItems).values(input).$returningId();
      return { id: item.id, ...input };
    }),

  // Admin: update gallery item
  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        caption: z.string().min(1),
        description: z.string(),
        image: z.string().min(1),
        style: z.string().min(1),
        weekSlot: z.string().min(1),
        products: z.array(
          z.object({
            name: z.string(),
            price: z.number(),
            link: z.string(),
            category: z.string(),
          })
        ),
        changes: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
          })
        ),
        colors: z.array(
          z.object({
            name: z.string(),
            hex: z.string(),
          })
        ),
        totalBudget: z.number(),
        timeEstimate: z.string(),
        difficulty: z.string(),
        isActive: z.number().default(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(galleryItems).set(data).where(eq(galleryItems.id, id));
      return { id, ...data };
    }),

  // Admin: delete gallery item
  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(galleryItems).where(eq(galleryItems.id, input.id));
      return { success: true, id: input.id };
    }),

  // Admin: toggle item active status
  toggleActive: publicQuery
    .input(z.object({ id: z.number(), isActive: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(galleryItems)
        .set({ isActive: input.isActive })
        .where(eq(galleryItems.id, input.id));
      return { id: input.id, isActive: input.isActive };
    }),
});
