export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { citizenship, targetCountry, income, familyStatus, timeline } = req.body;

    const prompt = `
Create a structured relocation strategy:

Citizenship: ${citizenship}
Target Country: ${targetCountry || "Open"}
Income: €${income}
Family: ${familyStatus}
Timeline: ${timeline}
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
          { role: "user", content: prompt }
        ]
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
      result: data.choices[0].message.content
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
