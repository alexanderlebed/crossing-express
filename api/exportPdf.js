import { getReport } from "./storage.js";
import PDFDocument from "pdfkit";

export default async function handler(req, res) {

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing ID" });
  }

  const report = getReport(id);

  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }

  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=SRIM-${id}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(18).text("SRIM Intelligence Report", { align: "center" });
  doc.moveDown();
  doc.fontSize(10).text("Confidential — Sovereign Relocation Intelligence Modeling", { align: "center" });
  doc.moveDown(2);

  doc.fontSize(12).text(report, {
    align: "left"
  });

  doc.end();
}
