const reports = new Map();

export function saveReport(id, data) {
  reports.set(id, data);
}

export function getReport(id) {
  return reports.get(id);
}
