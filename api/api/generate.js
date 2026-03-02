import OpenAI from "openai";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { profile } = req.body;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are Crossing Engine. Provide structured relocation strategy."
        },
        {
          role: "user",
          content: JSON.stringify(profile)
        }
      ],
      temperature: 0.3
    });

    res.status(200).json({
      result: completion.choices[0].message.content
    });

  } catch (error) {
    res.status(500).json({ error: "Generation failed" });
  }
}
