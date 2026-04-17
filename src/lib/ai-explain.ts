import { createServerFn } from "@tanstack/react-start";

interface ExplainInput {
  threat: string;
  ip: string;
  confidence: number;
  action: string;
}

export const explainThreat = createServerFn({ method: "POST" })
  .inputValidator((data: ExplainInput) => {
    if (!data || typeof data.threat !== "string" || typeof data.ip !== "string") {
      throw new Error("Invalid payload");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return {
        explanation:
          "AI explanation unavailable: LOVABLE_API_KEY not configured. (Enable Lovable Cloud to power live AI analysis.)",
        error: "missing_key" as const,
      };
    }

    const system = `You are a senior SOC analyst. Given a security alert, explain in 2 short paragraphs:
1. WHY THIS IS A THREAT — the technical mechanism, what an attacker is attempting, and the potential blast radius.
2. RECOMMENDED RESPONSE — concrete next steps tied to the suggested action.

Be precise, technical, and concise. Avoid fluff. No markdown headings. Use plain prose.`;

    const user = `Alert: ${data.threat}
Source IP: ${data.ip}
Model confidence: ${(data.confidence * 100).toFixed(0)}%
Suggested SOAR action: ${data.action}

Explain why this is a threat and what to do about it.`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          return {
            explanation: "Rate limit reached on the AI gateway. Please retry in a moment.",
            error: "rate_limit" as const,
          };
        }
        if (res.status === 402) {
          return {
            explanation:
              "AI workspace credits exhausted. Add credits in Settings → Workspace → Usage to re-enable analysis.",
            error: "payment_required" as const,
          };
        }
        const text = await res.text();
        console.error("AI gateway error", res.status, text);
        return { explanation: `AI gateway error (${res.status}).`, error: "gateway" as const };
      }

      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const explanation =
        json.choices?.[0]?.message?.content?.trim() ?? "No explanation generated.";
      return { explanation, error: null };
    } catch (e) {
      console.error("explainThreat failed", e);
      return {
        explanation: "AI analysis service is currently unavailable.",
        error: "network" as const,
      };
    }
  });
