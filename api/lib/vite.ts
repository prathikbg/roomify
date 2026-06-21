import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";

type App = Hono<{ Bindings: HttpBindings }>;

export function serveStaticFiles(app: App) {
  // Resolve the static dir relative to the bundled file's location, not cwd.
  // After esbuild bundling, this file is inlined into dist/index.js, so
  // import.meta.dirname === <appRoot>/dist, and dist/public sits next to it.
  const distPath = path.resolve(import.meta.dirname, "public");
  // serveStatic uses path.join(root, requestPath); join handles absolute roots
  // correctly so this works regardless of what cwd Passenger spawns us with.
  const staticRoot = path.relative(process.cwd(), distPath) || ".";

  app.use("*", serveStatic({ root: staticRoot }));

  app.notFound((c) => {
    const accept = c.req.header("accept") ?? "";
    if (!accept.includes("text/html")) {
      return c.json({ error: "Not Found" }, 404);
    }
    const indexPath = path.resolve(distPath, "index.html");
    const content = fs.readFileSync(indexPath, "utf-8");
    return c.html(content);
  });
}
