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

    // 3️⃣ Отправка красивого HTML email
    await resend.emails.send({
      from: "Crossing <no-reply@crossing.express>",
      to: email,
      subject: "SRIM Intelligence File — Confidential Delivery",
      html: `
      <div style="background:#0a0f18;padding:40px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <div style="max-width:600px;margin:0 auto;background:#111827;border:1px solid rgba(255,255,255,0.08);padding:40px;border-radius:12px;color:#e6edf3;">
          
          <div style="font-size:20px;font-weight:600;margin-bottom:10px;">
            Crossing
          </div>

          <div style="font-size:13px;opacity:0.6;margin-bottom:30px;">
            Sovereign Relocation Intelligence Modeling
          </div>

          <div style="font-size:16px;margin-bottom:20px;">
            Your SRIM Intelligence File has been generated.
          </div>

          <div style="line-height:1.7;font-size:14px;opacity:0.9;margin-bottom:30px;">
            This document represents a structured jurisdictional modeling output
            designed to support sovereign decision-making across regulatory environments.
          </div>

          <div style="padding:20px;background:rgba(79,140,255,0.08);border-left:3px solid #4f8cff;border-radius:6px;margin-bottom:30px;font-size:14px;">
            Confidential analytical material. Distribution beyond intended recipient is not recommended.
          </div>

          <div style="font-size:13px;opacity:0.6;">
            Crossing Strategic Navigation Laboratory<br>
            crossing.express
          </div>

        </div>
      </div>
      `,
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
