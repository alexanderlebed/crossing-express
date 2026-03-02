export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Жёстко парсим тело запроса
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    const citizenship  = body?.citizenship  || "";
    const targetCountry = body?.targetCountry || "";
    const income       = body?.income       || "";
    const familyStatus = body?.familyStatus || "";
    const timeline     = body?.timeline     || "";

    // ВРЕМЕННО убираем 400-проверки — сервер всегда должен ответить
    const previewPrompt = `
You are Crossing, a senior relocation strategist.

Profile:
Citizenship: ${citizenship}
Target Country: ${targetCountry || "Not fixed"}
Monthly Income: €${income}
Family Status: ${familyStatus}
Timeline: ${timeline}

Provide a SHORT strategic relocation assessment (max 8 lines).
Be specific. No generic advice.
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

    const data = await openaiResponse.json();

    if (!openaiResponse.ok) {
      return res.status(500).json({
        error: data.error?.message || "OpenAI error",
        debug: data
      });
    }

    return res.status(200).json({
      result: data.choices?.[0]?.message?.content || "No response",
      preview: true,
      debug_received_body: body
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
