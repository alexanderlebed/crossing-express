let reports = {};

export function saveReport(id, content) {
  reports[id] = content;
}

export function getReport(id) {
  return reports[id];
}
