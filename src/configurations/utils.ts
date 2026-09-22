export const toTitleCase = (value: string | null | undefined): string | null => {
  if (!value || value.trim() === "") return null;
  return value
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const isPast = (date: string | Date): boolean => {
  return new Date(date).getTime() < Date.now();
};
