import { saveReport } from "./storage.js";
import crypto from "crypto";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { citizenship, targetCountry, income, familyStatus, timeline } = req.body;

    const prompt = `
Generate a structured SRIM relocation assessment.

Citizenship: ${citizenship}
Target Country: ${targetCountry}
Income: €${income}
Family Status: ${familyStatus}
Timeline: ${timeline}

Return structured institutional output.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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

    const data = await response.json();

    const result = data.choices?.[0]?.message?.content || "No output.";

    const reportId = crypto.randomUUID();

    saveReport(reportId, result);

    res.status(200).json({ result, reportId });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
