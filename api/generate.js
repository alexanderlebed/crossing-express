export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const {
      citizenship,
      targetCountry,
      income,
      familyStatus,
      timeline,
      mode
    } = req.body;

    const isPreview = mode === "preview";

    const systemPrompt = `
You are SRIM — Sovereign Relocation Intelligence Modeling engine.

Your task is to provide structured, analytical relocation modeling.

Do NOT provide emotional tone.
Do NOT provide marketing language.
Do NOT provide generic travel advice.

Structure output clearly.

If mode is preview:
- Provide a short strategic outline (max 250 words)
- Highlight key structural factors only
- Do not provide deep modeling

If mode is full:
- Provide structured sections:
  1. Jurisdictional Feasibility
  2. Legal Pathways
  3. Economic Sustainability
  4. Risk Vectors
  5. Strategic Positioning
  6. Execution Timeline
- Write in analytical tone
- 800–1200 words
`;

    const userPrompt = `
Profile:
Citizenship: ${citizenship}
Target Country: ${targetCountry || "Open"}
Monthly Income: €${income}
Family Status: ${familyStatus}
Timeline: ${timeline}
Mode: ${mode}
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

    if (!response.ok) {
      return res.status(500).json({ error: data });
    }

    const result = data.choices[0].message.content;

    return res.status(200).json({ result });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
