/**
 * Export an array of objects as a CSV file download.
 *
 * @param data     - Array of objects to export
 * @param columns  - Column definitions: { key, title }
 * @param filename - Download filename (without .csv extension)
 */
export function exportToCsv(
  data: Record<string, any>[],
  columns: { key: string; title: string; render?: (value: any, row: any) => string }[],
  filename: string,
) {
  if (!data.length) return;

  const header = columns.map((c) => `"${c.title}"`).join(',');

  const rows = data.map((row) =>
    columns
      .map((col) => {
        const raw = col.key.split('.').reduce((obj, k) => obj?.[k], row);
        const value = col.render ? col.render(raw, row) : raw;
        const str = value == null ? '' : String(value);
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(','),
  );

  const csv = [header, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
