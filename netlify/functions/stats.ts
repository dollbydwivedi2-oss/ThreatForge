import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { scanResults } from "../../db/schema.js";
import { eq, sql } from "drizzle-orm";

export default async (req: Request) => {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId") || "anonymous";

  const [totals] = await db
    .select({
      total: sql<number>`count(*)::int`,
      phishing: sql<number>`count(*) filter (where verdict = 'Phishing')::int`,
      safe: sql<number>`count(*) filter (where verdict = 'Safe')::int`,
    })
    .from(scanResults)
    .where(eq(scanResults.userId, userId));

  const recent = await db
    .select()
    .from(scanResults)
    .where(eq(scanResults.userId, userId))
    .orderBy(sql`created_at desc`)
    .limit(10);

  return Response.json({
    total: totals?.total ?? 0,
    phishing: totals?.phishing ?? 0,
    safe: totals?.safe ?? 0,
    recent,
  });
};

export const config: Config = {
  path: "/api/stats",
};
