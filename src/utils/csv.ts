/**
 * CSV Import/Export utilities for spreadsheet operations
 */

export function exportToCSV<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  headers?: { key: keyof T; label: string }[]
) {
  if (!rows || !rows.length) {
    alert('Tidak ada data untuk diunduh.');
    return;
  }

  const separator = ',';
  let keys: string[] = [];
  let headerRow = '';

  if (headers && headers.length > 0) {
    keys = headers.map(h => String(h.key));
    headerRow = headers.map(h => `"${h.label.replace(/"/g, '""')}"`).join(separator);
  } else {
    keys = Object.keys(rows[0]);
    headerRow = keys.map(k => `"${k.replace(/"/g, '""')}"`).join(separator);
  }

  const csvContent = [
    headerRow,
    ...rows.map(row =>
      keys
        .map(key => {
          const val = row[key];
          if (val === undefined || val === null) return '""';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(separator)
    )
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Basic CSV splitting handling quotes
    const regex = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^",]*))/g;
    const rowValues: string[] = [];
    let match;
    while ((match = regex.exec(lines[i])) !== null) {
      // index 1 is quoted, index 2 is unquoted
      const val = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
      rowValues.push(val !== undefined ? val.trim() : '');
    }

    if (rowValues.length > 0) {
      const obj: Record<string, string> = {};
      headers.forEach((header, idx) => {
        obj[header] = rowValues[idx] || '';
      });
      results.push(obj);
    }
  }

  return results;
}
