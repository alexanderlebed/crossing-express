export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { citizenship, targetCountry, income, familyStatus, timeline } = req.body;

    const prompt = `
You are Crossing, a professional AI relocation strategist.

Create a structured relocation strategy based on:

Citizenship: ${citizenship}
Target Country: ${targetCountry || "Open to suggestions"}
Monthly Income: €${income}
Family Status: ${familyStatus}
Timeline: ${timeline}

Provide:
1. Best country options (if target not fixed)
2. Visa/residency pathway
3. Timeline breakdown
4. Legal considerations
5. Risk factors
6. Recommended next steps

Be precise, structured, and realistic.
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
          { role: "system", content: "You are Crossing, an elite AI relocation advisor." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    return res.status(200).json({
      result: data.choices[0].message.content
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
