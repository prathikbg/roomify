import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { startTrendCron } from "./lib/trend-cron";

const app = new Hono<{ Bindings: HttpBindings }>();

// Keep the trend cache warm — runs in both dev (via vite middleware) and prod.
startTrendCron();

// Health check endpoint
app.get("/api/health", (c) => c.json({ status: "ok", ts: Date.now() }));

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  const hostname = process.env.HOST || "0.0.0.0";

  console.log("[boot] starting Roomify server");
  console.log("[boot] NODE_ENV          =", process.env.NODE_ENV);
  console.log("[boot] PORT (env)        =", process.env.PORT ?? "(unset → using 3000)");
  console.log("[boot] HOST (env)        =", process.env.HOST ?? "(unset → using 0.0.0.0)");
  console.log("[boot] bound port        =", port);
  console.log("[boot] bound hostname    =", hostname);
  console.log("[boot] DATABASE_URL set? =", Boolean(process.env.DATABASE_URL));
  console.log("[boot] AI_PROVIDER       =", process.env.AI_PROVIDER ?? "(unset)");
  console.log("[boot] node version      =", process.version);
  console.log("[boot] cwd               =", process.cwd());

  process.on("uncaughtException", (err) => {
    console.error("[boot] uncaughtException:", err);
  });
  process.on("unhandledRejection", (reason) => {
    console.error("[boot] unhandledRejection:", reason);
  });
  process.on("SIGTERM", () => console.log("[boot] received SIGTERM"));
  process.on("SIGINT", () => console.log("[boot] received SIGINT"));

  serve({ fetch: app.fetch, port, hostname }, (info) => {
    console.log(`[boot] LISTENING on http://${hostname}:${port}/ (actual: ${info.address}:${info.port})`);
  });
}
