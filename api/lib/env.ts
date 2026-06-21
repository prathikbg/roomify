import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";

const REQUIRED_VARS = ["APP_ID", "APP_SECRET", "DATABASE_URL"] as const;

function readWithCollect(name: string, missing: string[]): string {
  const value = process.env[name];
  if (!value) {
    if (isProduction) missing.push(name);
    return "";
  }
  return value;
}

const missing: string[] = [];
const values = Object.fromEntries(
  REQUIRED_VARS.map((name) => [name, readWithCollect(name, missing)]),
) as Record<(typeof REQUIRED_VARS)[number], string>;

if (missing.length > 0) {
  const lines = [
    "[boot] FATAL: missing required environment variable(s) in production:",
    ...missing.map((name) => `  - ${name}`),
    "[boot] set these on the Hostinger Node.js app config (Environment Variables) and restart.",
  ];
  // Write directly to stderr so the message survives any logger setup and lands
  // in Passenger's error log verbatim, instead of being buried in a bundled stack.
  process.stderr.write(lines.join("\n") + "\n");
  throw new Error(
    `Missing required environment variable(s): ${missing.join(", ")}`,
  );
}

export const env = {
  appId: values.APP_ID,
  appSecret: values.APP_SECRET,
  databaseUrl: values.DATABASE_URL,
  isProduction,
};
