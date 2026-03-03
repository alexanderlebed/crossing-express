const { Resend } = require("resend");
const PDFDocument = require("pdfkit");

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, report } = req.body;

  if (!email || !report) {
    return res.status(400).json({ error: "Missing email or report ID" });
  }

  try {

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "RESEND_API_KEY is undefined" });
    }

    const resend = new Resend(apiKey);

    // 1️⃣ Получаем отчёт из Supabase
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
      const errText = await response.text();
      throw new Error("Supabase error: " + errText);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Report not found" });
    }

    const content = data[0].content;

    // 2️⃣ Генерация PDF
    const doc = new PDFDocument();
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.text(content);
    doc.end();

    await new Promise(resolve => doc.on("end", resolve));

    const pdfBuffer = Buffer.concat(buffers);

    // 3️⃣ Отправка email уже от crossing.express
    await resend.emails.send({
      from: "Crossing <no-reply@crossing.express>",
      to: email,
      subject: "Your SRIM Intelligence File",
      text: "Your SRIM report is attached.",
      attachments: [
        {
          filename: "SRIM-Intelligence-File.pdf",
          content: pdfBuffer
        }
      ]
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
