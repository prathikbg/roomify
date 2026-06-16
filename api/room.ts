import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { roomUploads, makeoverResults, furnitureItems, contacts } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const roomRouter = createRouter({
  // Upload a room photo
  upload: publicQuery
    .input(
      z.object({
        roomType: z.string().min(1),
        designStyle: z.string().min(1),
        budgetRange: z.string().optional(),
        originalImage: z.string().min(1), // base64 or URL
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [upload] = await db.insert(roomUploads).values(input).$returningId();
      return { id: upload.id, ...input };
    }),

  // Get a single upload by ID
  getUpload: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(roomUploads)
        .where(eq(roomUploads.id, input.id))
        .limit(1);
      return result[0] ?? null;
    }),

  // List all uploads
  listUploads: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(roomUploads)
      .orderBy(desc(roomUploads.createdAt))
      .limit(50);
  }),

  // Create a makeover result
  createResult: publicQuery
    .input(
      z.object({
        uploadId: z.number(),
        generatedImage: z.string().min(1),
        colorPalette: z
          .array(z.object({ name: z.string(), hex: z.string() }))
          .optional(),
        pinterestImage: z.string().optional(),
        totalBudget: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db
        .insert(makeoverResults)
        .values(input)
        .$returningId();
      return { id: result.id, ...input };
    }),

  // Get makeover result by upload ID
  getResult: publicQuery
    .input(z.object({ uploadId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(makeoverResults)
        .where(eq(makeoverResults.uploadId, input.uploadId))
        .limit(1);
      return result[0] ?? null;
    }),

  // Add furniture items to a result
  addFurniture: publicQuery
    .input(
      z.array(
        z.object({
          resultId: z.number(),
          name: z.string().min(1),
          price: z.number(),
          category: z.string().min(1),
          affiliateLink: z.string().min(1),
        })
      )
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(furnitureItems).values(input);
      return { count: input.length };
    }),

  // Get furniture items by result ID
  getFurniture: publicQuery
    .input(z.object({ resultId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(furnitureItems)
        .where(eq(furnitureItems.resultId, input.resultId));
    }),

  // Submit a contact/lead
  submitContact: publicQuery
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [contact] = await db
        .insert(contacts)
        .values(input)
        .$returningId();
      return { id: contact.id, ...input };
    }),
});
