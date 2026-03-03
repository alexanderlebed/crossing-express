import { kv } from "@vercel/kv";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { citizenship, targetCountry, income, familyStatus, timeline } = req.body;

    if (!citizenship || !income) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const systemPrompt = `
You are SRIM — Sovereign Relocation Intelligence Model.

You are not a chatbot.
You are a strategic relocation intelligence engine.

You MUST generate the report using the exact structure below.

===== STRUCTURE =====

I. EXECUTIVE INTELLIGENCE SUMMARY
- Strategic Position
- Primary Vector
- Structural Vulnerability
- Immediate Window of Action

II. ARCHETYPE CLASSIFICATION
Classify user into one:
Capital Protector
Mobility Seeker
Strategic Optimizer
Exit Under Constraint
Lifestyle Relocator

Explain briefly why.

III. JURISDICTIONAL SCORING MATRIX
Provide table with scores (0–10):
Legal Accessibility
Economic Sustainability
Political Stability
Tax Exposure
Strategic Optionality

Provide Composite SRIM Index.

IV. RISK VECTOR ANALYSIS
- Regulatory Volatility Risk
- Currency Exposure Risk
- Legal Lock-In Risk
- Dependency Concentration Risk

V. STRATEGIC PATHWAY MODEL
Phase 1 — Positioning
Phase 2 — Entry
Phase 3 — Stabilization
Phase 4 — Optionality Expansion

VI. STRUCTURAL RECOMMENDATION
Conditional strategic logic:
If income rises →
If instability increases →
If target blocked →

===== RULES =====
- No emojis
- No marketing tone
- No casual language
- Structured, intelligence-grade writing
- No fluff
- Clear analytical style
`;

    const userPrompt = `
Profile:
Citizenship: ${citizenship}
Target Country: ${targetCountry || "Open"}
Monthly Income: €${income}
Family Status: ${familyStatus}
Timeline: ${timeline}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.4
      })
    });

    const data = await response.json();

    if (!data.choices) {
      return res.status(500).json({ error: data });
    }

    const report = data.choices[0].message.content;

    const sessionId = "srim_" + Date.now();

    await kv.set(sessionId, report);

    res.status(200).json({ sessionId });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
