function normalizeValue(value: string): string {
  return value.trim().toLowerCase();
}

export function matchesNameOrAlias(name: string, aliases: string[], query: string): boolean {
  const normalizedQuery = normalizeValue(query);

  if (normalizeValue(name) === normalizedQuery) {
    return true;
  }

  return aliases.some((alias) => normalizeValue(alias) === normalizedQuery);
}
