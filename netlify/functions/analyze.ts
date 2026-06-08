import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { scanResults } from "../../db/schema.js";

function analyzeMessage(message: string) {
  const lower = message.toLowerCase();
  let score = 0;
  const reasons: string[] = [];

  const keywords = [
    "urgent", "verify", "account", "password",
    "click", "login", "bank", "otp",
    "suspended", "limited time", "security alert",
  ];

  for (const word of keywords) {
    if (lower.includes(word)) {
      score += 10;
      reasons.push(`Contains '${word}'`);
    }
  }

  if (/https?:\/\//.test(lower)) {
    score += 20;
    reasons.push("Contains a link");
  }

  if (message.includes("!")) {
    score += 5;
    reasons.push("Uses urgency (!)");
  }

  if (lower.includes("immediately") || lower.includes("now")) {
    score += 10;
    reasons.push("Creates urgency");
  }

  if (message.includes("@") && message.includes(".")) {
    score += 5;
    reasons.push("Contains email-like pattern");
  }

  const verdict = score >= 40 ? "Phishing" : "Safe";
  return {
    verdict,
    score: Math.min(score, 100),
    reason: reasons.length ? reasons.join(", ") : "No strong phishing signals",
  };
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { message, userId } = await req.json();

  if (!message) {
    return Response.json({ error: "Empty message" }, { status: 400 });
  }

  const result = analyzeMessage(message);
  const uid = userId || "anonymous";

  await db.insert(scanResults).values({
    userId: uid,
    message,
    verdict: result.verdict,
    score: result.score,
    reason: result.reason,
  });

  return Response.json(result);
};

export const config: Config = {
  path: "/api/analyze",
};
