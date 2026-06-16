import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getTrends, fetchAndCacheTrends } from "./trend-aggregator";

export const trendsRouter = createRouter({
  // Get current trends (cached or fresh)
  current: publicQuery
    .input(
      z.object({
        room: z.string().optional(),
        fresh: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const result = await getTrends(input?.fresh ?? false);

      if (input?.room && result.byRoom[input.room]) {
        return {
          ...result,
          topTrends: result.byRoom[input.room],
        };
      }

      return result;
    }),

  // Force refresh trends from all sources
  refresh: publicQuery.mutation(async () => {
    const start = Date.now();
    const result = await fetchAndCacheTrends();
    return {
      ...result,
      fetchTimeMs: Date.now() - start,
    };
  }),

  // Get trends grouped by room category
  byRoom: publicQuery
    .input(
      z.object({
        room: z.string(),
      }).optional()
    )
    .query(async ({ input }) => {
      const result = await getTrends();

      if (input?.room) {
        return {
          trends: result.byRoom[input.room] || [],
          room: input.room,
          lastUpdated: result.lastUpdated,
        };
      }

      return {
        trends: result.topTrends,
        rooms: Object.keys(result.byRoom),
        lastUpdated: result.lastUpdated,
      };
    }),

  // Get top trending styles (simplified list)
  topStyles: publicQuery.query(async () => {
    const result = await getTrends();
    return result.topTrends.slice(0, 10).map((t) => ({
      keyword: t.keyword,
      score: t.score,
      growthRate: t.growthRate,
      roomCategory: t.roomCategory,
      styleTag: t.styleTag,
    }));
  }),
});
