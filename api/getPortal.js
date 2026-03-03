import { getReport } from "./storage.js";

export default async function handler(req, res) {

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing ID" });
  }

  const report = getReport(id);

  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }

  return res.status(200).json({
    report
  });
}
