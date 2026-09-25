export function pickFirstError(errors: Iterable<{ path: string; message: string }>) {
  for (const error of errors) {
    return { field: error.path.replace(/^\//, '').split('/')[0], message: error.message };
  }
  return undefined;
}

export function coerceQuery(raw: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value)) {
      result[key] = value[0];
    } else if (key === 'available') {
      result[key] = value === 'true' || value === '1';
    } else if (key === 'priceMin' || key === 'priceMax' || key === 'page' || key === 'pageSize') {
      const n = Number(value);
      result[key] = Number.isFinite(n) ? n : value;
    } else {
      result[key] = value;
    }
  }
  return result;
}
