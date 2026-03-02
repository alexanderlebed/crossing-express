export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { citizenship, targetCountry, income, familyStatus, timeline } = req.body;

    if (!citizenship || !income) {
      return res.status(400).json({
        error: "Citizenship and income are required."
      });
    }

    const previewPrompt = `
You are Crossing, a senior relocation strategist.

Profile:
Citizenship: ${citizenship}
Target Country: ${targetCountry || "Not fixed"}
Monthly Income: €${income}
Family Status: ${familyStatus}
Timeline: ${timeline}

Provide a SHORT strategic relocation assessment (maximum 10 lines).

Rules:
- No generic advice
- No motivational language
- No full visa breakdown
- No execution roadmap
- Provide only high-level direction

Be analytical and specific.
`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an elite relocation strategist." },
          { role: "user", content: previewPrompt }
        ],
        temperature: 0.6
      })
    });

    const text = await openaiResponse.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({
        error: "Invalid JSON from OpenAI",
        raw: text
      });
    }

    if (!openaiResponse.ok) {
      return res.status(500).json({
        error: data.error?.message || "OpenAI error"
      });
    }

    return res.status(200).json({
      result: data.choices[0].message.content,
      preview: true
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
