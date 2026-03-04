import fs from "fs";
import path from "path";

function computeVectorScore(F, S, P) {
  return ((F + S + (10 - P)) / 3) * 10;
}

function computeSVI(v) {
  const RA = computeVectorScore(v.RA.F, v.RA.S, v.RA.P);
  const MPS = computeVectorScore(v.MPS.F, v.MPS.S, v.MPS.P);
  const CTE = computeVectorScore(v.CTE.F, v.CTE.S, v.CTE.P);
  const TRF = computeVectorScore(v.TRF.F, v.TRF.S, v.TRF.P);
  const GDR = computeVectorScore(v.GDR.F, v.GDR.S, v.GDR.P);

  const total =
    RA * 0.25 +
    MPS * 0.20 +
    CTE * 0.20 +
    TRF * 0.15 +
    GDR * 0.20;

  return {
    RA,
    MPS,
    CTE,
    TRF,
    GDR,
    total: Math.round(total)
  };
}

function classify(score) {
  if (score <= 40) return "High structural stability";
  if (score <= 55) return "Moderate volatility";
  if (score <= 70) return "Elevated volatility";
  if (score <= 85) return "High structural instability";
  return "Systemic discontinuity";
}

export default function handler(req, res) {
  const { country } = req.query;

  if (!country) {
    return res.status(400).json({ error: "Country required" });
  }

  const filePath = path.join(process.cwd(), "data", "svi.json");
  const raw = fs.readFileSync(filePath);
  const data = JSON.parse(raw);

  const key = country.toLowerCase();

  if (!data[key]) {
    return res.status(404).json({ error: "Country not found" });
  }

  const computed = computeSVI(data[key].vectors);

  return res.status(200).json({
    country: data[key].country,
    vector_scores: computed,
    band: classify(computed.total)
  });
}
