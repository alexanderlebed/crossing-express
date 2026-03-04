# Sovereign Volatility Index (SVI)
## Data Structure & Versioning Model v1.0

---

## 1. Purpose

This document defines the structured data architecture of SVI country assessments.

It formalizes:

- Storage logic
- Versioning logic
- Audit trace requirements
- Update integrity controls

SVI data is not a static score.
It is a structured assessment record.

---

## 2. Core Data Model

Each country assessment must follow this schema:

{
  "country": "Country Name",
  "iso_code": "ISO2",
  "assessment_version": "SVI-1.1",
  "assessment_date": "YYYY-MM",
  "vectors": {
    "RA": { "F": 0, "S": 0, "P": 0 },
    "MPS": { "F": 0, "S": 0, "P": 0 },
    "CTE": { "F": 0, "S": 0, "P": 0 },
    "TRF": { "F": 0, "S": 0, "P": 0 },
    "GDR": { "F": 0, "S": 0, "P": 0 }
  },
  "computed_scores": {
    "RA_score": 0,
    "MPS_score": 0,
    "CTE_score": 0,
    "TRF_score": 0,
    "GDR_score": 0,
    "SVI_total": 0,
    "volatility_band": ""
  },
  "revision_note": ""
}

---

## 3. Calculation Logic

Vector Score Formula:

Vector Score = ((F + S + (10 - P)) / 3) × 10

Final SVI:

SVI =  
(RA × 0.25) +  
(MPS × 0.20) +  
(CTE × 0.20) +  
(TRF × 0.15) +  
(GDR × 0.20)

Volatility band classification:

0–40 → High structural stability  
40–55 → Moderate volatility  
55–70 → Elevated volatility  
70–85 → High structural instability  
85–100 → Systemic discontinuity  

---

## 4. Versioning Requirements

Each assessment must include:

- assessment_version
- assessment_date
- explicit revision_note

Any structural change to:

- Weights
- Formula
- Interpretation bands

Requires:

- Major version increment
- Governance record update
- Protocol documentation revision

---

## 5. Revision Control

Revisions may occur:

- Annually (scheduled)
- Event-triggered
- Methodology-triggered

Each revision must document:

- What changed
- Why it changed
- Which vectors were reassessed
- Whether volatility band changed

---

## 6. Data Integrity Rules

SVI data must:

- Be stored in structured format (JSON or database record)
- Remain immutable after publication
- Be archived when replaced
- Maintain historical traceability

No retroactive silent edits permitted.

---

## 7. Institutional Scaling Provision

This data model supports:

- Multi-country batch release
- Regional clustering
- Longitudinal volatility tracking
- Institutional licensing integration

---

Version: SVI-DATA-1.0  
Maintained by: Crossing Strategic Navigation Laboratory  
Status: Data Architecture Formalized
