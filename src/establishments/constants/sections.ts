/** Shared category vocabularies for the Accommodation and Employment
 * sections — "other" is always a valid category value, paired with a
 * free-typed categoryLabel for the custom name. */
export const ACCOMMODATION_CATEGORIES = [
  "single_rooms",
  "double_rooms",
  "executive",
  "suites",
  "apartments",
  "other",
] as const;

export const ACCOMMODATION_CATEGORY_LABELS: Record<string, string> = {
  single_rooms: "Single Rooms",
  double_rooms: "Double Rooms",
  executive: "Executive",
  suites: "Suites",
  apartments: "Apartments",
  other: "Other",
};

export const EMPLOYMENT_CATEGORIES = [
  "management",
  "technical_professional",
  "administrative",
  "front_desk",
  "housekeeping",
  "food_beverage",
  "security",
  "maintenance",
  "other",
] as const;

export const EMPLOYMENT_CATEGORY_LABELS: Record<string, string> = {
  management: "Management",
  technical_professional: "Technical / Professional",
  administrative: "Administrative",
  front_desk: "Front Desk",
  housekeeping: "Housekeeping",
  food_beverage: "Food & Beverage",
  security: "Security",
  maintenance: "Maintenance",
  other: "Other",
};

export const SECTION_STATUSES = ["draft", "complete"] as const;
export type SectionStatus = (typeof SECTION_STATUSES)[number];

export const MIN_REPORTING_YEAR = 2022;
export const maxReportingYear = (): number => new Date().getFullYear();
