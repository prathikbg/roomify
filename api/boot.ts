// Print boot banner FIRST so it appears in Passenger logs even if a downstream
// import (e.g. ./lib/env) throws at module-load time due to missing env vars.
if (process.env.NODE_ENV === "production") {
  console.log("[boot] starting Roomify server");
  console.log(`[boot] cwd=${process.cwd()} node=${process.version} pid=${process.pid}`);
  console.log(`[boot] PORT (env)=${process.env.PORT ?? "<unset>"}`);
}

import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";

const app = new Hono<{ Bindings: HttpBindings }>();

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

// Start the HTTP server when this file is the process entry point (i.e. run via
// `node dist/index.js` on Hostinger). The vite dev server imports `app` as a
// module rather than executing the bundle, so this guard keeps `npm run dev`
// from double-binding the port. Relying on NODE_ENV alone is fragile — Hostinger
// does not always set it, which silently exits the process and produces 503s.
const isEntryPoint = (() => {
  try {
    const argvUrl = process.argv[1] ? new URL(`file://${process.argv[1]}`).href : "";
    return import.meta.url === argvUrl;
  } catch {
    return false;
  }
})();

if (env.isProduction || isEntryPoint) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port, hostname: "0.0.0.0" }, (info) => {
    console.log(`[boot] LISTENING on http://0.0.0.0:${port}/ (actual: ${info.address}:${info.port})`);
  });

  process.on("uncaughtException", (err) => {
    console.error("[boot] uncaughtException:", err);
  });
  process.on("unhandledRejection", (err) => {
    console.error("[boot] unhandledRejection:", err);
  });
}
