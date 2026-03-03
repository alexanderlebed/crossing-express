export default async function handler(req, res) {

  const { report } = req.query;

  if (!report) {
    return res.status(400).json({ error: "Missing report ID" });
  }

  try {

    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/reports?id=eq.${report}`,
      {
        method: "GET",
        headers: {
          "apikey": process.env.SUPABASE_SERVICE_KEY,
          "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error("Supabase fetch failed: " + errorText);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.status(200).json({ content: data[0].content });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
