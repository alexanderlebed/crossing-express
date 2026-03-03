import { Resend } from "resend";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, report } = req.body;

  if (!email || !report) {
    return res.status(400).json({ error: "Missing email or report ID" });
  }

  try {

    // 1. Получаем отчёт из Supabase
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

    const data = await response.json();

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Report not found" });
    }

    const content = data[0].content;

    // 2. Генерируем PDF в памяти
    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument();
    let buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {

      const pdfBuffer = Buffer.concat(buffers);

      const resend = new Resend(process.env.RESEND_API_KEY);

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

      res.status(200).json({ success: true });
    });

    doc.fontSize(12).text(content);
    doc.end();

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
