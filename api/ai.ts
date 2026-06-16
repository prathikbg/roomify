import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  generateRoomMakeover,
  getColorPalette,
  getFurnitureRecommendations,
  getTotalBudget,
  getGenerationStats,
} from "./ai-service";

export const aiRouter = createRouter({
  // Generate a room makeover image
  generate: publicQuery
    .input(
      z.object({
        roomType: z.string().min(1),
        designStyle: z.string().min(1),
        // Optional base64 data URL of the user's uploaded room photo.
        // When supplied with AI_PROVIDER=leonardo, runs image-to-image so the
        // redesign preserves the original room's layout.
        uploadedImage: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await generateRoomMakeover(
          input.roomType,
          input.designStyle,
          input.uploadedImage
        );
        return {
          success: true,
          imageUrl: result.imageUrl,
          provider: result.provider,
          cost: result.cost,
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Generation failed";
        return {
          success: false,
          error: message,
          imageUrl: null,
          provider: "error",
          cost: "$0",
        };
      }
    }),

  // Get color palette for a style
  getPalette: publicQuery
    .input(z.object({ designStyle: z.string().min(1) }))
    .query(({ input }) => {
      return getColorPalette(input.designStyle);
    }),

  // Get furniture recommendations for a room type
  getFurniture: publicQuery
    .input(z.object({ roomType: z.string().min(1) }))
    .query(({ input }) => {
      return {
        items: getFurnitureRecommendations(input.roomType),
        totalBudget: getTotalBudget(input.roomType),
      };
    }),

  // Get AI service status
  status: publicQuery.query(() => {
    const stats = getGenerationStats();
    return {
      provider: stats.provider,
      isMock: stats.provider === "mock",
      generationsToday: stats.count,
      message:
        stats.provider === "mock"
          ? "AI is in DEMO mode. Add an API key to .env to enable real image generation."
          : `AI is active using ${stats.provider}.`,
    };
  }),
});
