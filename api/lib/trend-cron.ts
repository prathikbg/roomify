import { fetchAndCacheTrends, getCachedTrends } from "../trend-aggregator";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const WARMUP_DELAY_MS = 8_000;

let started = false;
let running = false;
let timer: ReturnType<typeof setInterval> | null = null;

async function runOnce(reason: string) {
  if (running) {
    console.log(`[trend-cron] skip (${reason}) — already running`);
    return;
  }
  running = true;
  const start = Date.now();
  try {
    const result = await fetchAndCacheTrends();
    console.log(
      `[trend-cron] ${reason} ok — ${result.topTrends.length} trends in ${Date.now() - start}ms`
    );
  } catch (err) {
    console.warn(`[trend-cron] ${reason} failed:`, err instanceof Error ? err.message : err);
  } finally {
    running = false;
  }
}

async function shouldWarmOnBoot(): Promise<boolean> {
  try {
    const cached = await getCachedTrends();
    if (!cached) return true;
    const age = Date.now() - new Date(cached.lastUpdated).getTime();
    return age >= SIX_HOURS_MS;
  } catch {
    return true;
  }
}

export function startTrendCron() {
  if (started) return;
  started = true;

  // Warmup: only fetch if cache is missing or stale, after a short delay so boot is fast.
  setTimeout(() => {
    void shouldWarmOnBoot().then((stale) => {
      if (stale) void runOnce("warmup");
      else console.log("[trend-cron] warmup skipped — cache fresh");
    });
  }, WARMUP_DELAY_MS);

  // Recurring refresh every 6 hours.
  timer = setInterval(() => {
    void runOnce("scheduled");
  }, SIX_HOURS_MS);

  console.log("[trend-cron] started — refresh every 6h");
}

export function stopTrendCron() {
  if (timer) clearInterval(timer);
  timer = null;
  started = false;
}
