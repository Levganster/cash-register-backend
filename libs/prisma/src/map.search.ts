export function mapSearch<T>(where: T, excludedValues: string[] = []): T {
  if (!where) {
    return {} as T;
  }
  return Object.entries(where).reduce((acc, [key, value]) => {
    if (excludedValues.includes(key)) {
      return acc;
    }

    if (typeof value === 'string') {
      acc[key] = { contains: value.toLowerCase(), mode: 'insensitive' };
    } else {
      acc[key] = value;
    }
    return acc;
  }, {} as T);
}
