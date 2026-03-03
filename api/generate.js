import crypto from "crypto";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { citizenship, targetCountry, income, familyStatus, timeline } = req.body;

    const prompt = `
Generate a structured SRIM relocation assessment.
Return clean institutional text without markdown formatting or asterisks.

Citizenship: ${citizenship}
Target Country: ${targetCountry}
Income: €${income}
Family Status: ${familyStatus}
Timeline: ${timeline}
`;

    // 1️⃣ Generate report from OpenAI
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const aiData = await aiResponse.json();
    let result = aiData.choices?.[0]?.message?.content || "No output.";

    // Remove markdown symbols defensively
    result = result
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/#+\s/g, "")
      .replace(/---/g, "")
      .trim();

    const reportId = crypto.randomUUID();

    // 2️⃣ Save into Supabase
    const saveResponse = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/reports`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": process.env.SUPABASE_SERVICE_KEY,
          "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          id: reportId,
          content: result
        })
      }
    );

    if (!saveResponse.ok) {
      const errorText = await saveResponse.text();
      throw new Error("Supabase insert failed: " + errorText);
    }

    res.status(200).json({ result, reportId });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
