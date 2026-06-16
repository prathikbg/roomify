import { createRouter, publicQuery } from "./middleware";
import { roomRouter } from "./room";
import { galleryRouter } from "./gallery";
import { aiRouter } from "./ai";
import { trendsRouter } from "./trends";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  room: roomRouter,
  gallery: galleryRouter,
  ai: aiRouter,
  trends: trendsRouter,
});

export type AppRouter = typeof appRouter;
