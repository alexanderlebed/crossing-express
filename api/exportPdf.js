import { createClient } from "@supabase/supabase-js";
import PDFDocument from "pdfkit";
import getStream from "get-stream";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {

  const { report } = req.query;

  if (!report) {
    return res.status(400).json({ error: "Missing report ID" });
  }

  try {

    const { data, error } = await supabase
      .from("reports")
      .select("content")
      .eq("id", report)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Report not found" });
    }

    const doc = new PDFDocument({
      margin: 50
    });

    doc.fontSize(18).text("SRIM Intelligence File", { align: "left" });
    doc.moveDown();
    doc.fontSize(12).text("Confidential");
    doc.moveDown(2);

    doc.fontSize(11).text(data.content, {
      align: "left",
      lineGap: 4
    });

    doc.end();

    const pdfBuffer = await getStream.buffer(doc);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=SRIM_Report_${report}.pdf`
    );

    res.send(pdfBuffer);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
