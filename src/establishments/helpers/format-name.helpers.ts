/**
 * Title-cases a business name, collapsing internal whitespace. Single-letter
 * words are left exactly as given (not forced to upper/lowercase) — matches
 * the DB migration that normalized existing rows the same way, so a name
 * looks the same whether it came through the app or was seeded directly.
 */
/**
 * Escapes Postgres ILIKE wildcard characters (`%`, `_`) and the escape
 * character itself (`\`) in free-text search input, so a search term is
 * always matched literally rather than as a pattern the caller controls
 * (e.g. typing "%" shouldn't match every row, "_" shouldn't match any
 * single character).
 */
export const escapeLikePattern = (value: string): string => value.replace(/[\\%_]/g, "\\$&");

export const formatEstablishmentName = (
  value: string | null | undefined,
): string | null | undefined => {
  if (value === null || value === undefined) return value;

  const collapsed = value.trim().replace(/\s+/g, " ");
  if (collapsed === "") return collapsed;

  return collapsed
    .split(" ")
    .map((word) =>
      word.length <= 1 ? word : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join(" ");
};
