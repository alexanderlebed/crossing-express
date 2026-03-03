export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const { session_id, profile } = req.body;

    if (!session_id) {
      return res.status(400).json({ error: "Missing session_id" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(403).json({ error: "Payment not verified" });
    }

    // Генерируем полный отчёт
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: `
You are SRIM — Sovereign Relocation Intelligence Modeling engine.

Provide full structured analytical relocation modeling.
800–1200 words.
Formal intelligence memo tone.
No marketing language.
            `
          },
          {
            role: "user",
            content: `
Citizenship: ${profile.citizenship}
Target Country: ${profile.targetCountry}
Income: €${profile.income}
Family Status: ${profile.familyStatus}
Timeline: ${profile.timeline}
Mode: FULL
            `
          }
        ]
      })
    });

    const data = await aiResponse.json();

    return res.status(200).json({
      report: data.choices[0].message.content
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
