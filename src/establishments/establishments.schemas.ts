import Joi from "joi";
import { LOCAL_GOVERNMENTS, NIGERIAN_PHONE_REGEX } from "../configurations/constants";
import { paginationSchemaFields } from "../configurations/pagination";
import { EntityType } from "./HospitalityEstablishment";

const HOTEL_LIKE = [EntityType.Hotel];
const DINING_LIKE = [EntityType.Restaurant, EntityType.Lounge, EntityType.Bar];

const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;

export const phoneSchema = Joi.string().trim().pattern(NIGERIAN_PHONE_REGEX).messages({
  "string.pattern.base": "Invalid Nigerian phone number. Format: 0803XXXXXXX or 234803XXXXXXX",
});

// The one consolidated schema for a fully-submittable establishment — used by
// POST /establishments, POST /establishments/bulk, POST /establishments/draft/:id/submit,
// and admin's bulk-add-establishments. Replaces the old divergent
// businessRegistrationSchema/hotelSchema/bulkHotelSchema.
export const establishmentSchema = Joi.object({
  entityType: Joi.string()
    .valid(...Object.values(EntityType))
    .required()
    .messages({
      "any.only": "Invalid business type selected",
      "any.required": "Business type is required",
    }),

  businessName: Joi.string().trim().min(2).max(200).required().messages({
    "string.empty": "Business name is required",
    "any.required": "Business name is required",
  }),

  businessPhoneNumber: phoneSchema.required().messages({
    "any.required": "Business phone number is required",
  }),

  address: Joi.string().trim().min(4).max(500).required().messages({
    "any.required": "Full business address is required",
  }),

  localGovernment: Joi.string()
    .valid(...LOCAL_GOVERNMENTS)
    .required()
    .messages({
      "any.only": "Invalid local government selected",
      "any.required": "Local government is required",
    }),

  hasWebsite: Joi.boolean().default(false),

  website: Joi.when("hasWebsite", {
    is: true,
    then: Joi.string().trim().pattern(URL_REGEX).required().messages({
      "string.pattern.base": "Please enter a valid website URL",
      "any.required": "Website URL is required when you have a website",
    }),
    otherwise: Joi.string().allow("", null).optional(),
  }),

  yearEstablished: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .required()
    .messages({
      "any.required": "Year of establishment is required",
    }),

  contactName: Joi.string().trim().min(2).max(100).required().messages({
    "any.required": "Contact name is required",
  }),

  contactPhoneNumber: phoneSchema.required().messages({
    "any.required": "Contact phone number is required",
  }),

  contactEmail: Joi.string().trim().email().required().messages({
    "any.required": "Contact email address is required",
  }),

  businessEmail: Joi.string().trim().email().required().messages({
    "any.required": "Business email address is required",
  }),

  // `.required()` on the `is` schema matters: without it, Joi treats an
  // ABSENT entityType (e.g. a partial update payload that only claims
  // ownership) as satisfying `is`, wrongly routing into the "then" branch
  // instead of "otherwise" — since a schema with no explicit presence
  // allows undefined by default, so a missing peer trivially "matches".
  roomCount: Joi.when("entityType", {
    is: Joi.valid(...HOTEL_LIKE).required(),
    then: Joi.number().integer().min(1).required().messages({
      "any.required": "Room count is required for hotels",
    }),
    otherwise: Joi.number().integer().min(1).allow(null).optional(),
  }),

  bedSpaces: Joi.when("entityType", {
    is: Joi.valid(...HOTEL_LIKE).required(),
    then: Joi.number().integer().min(1).required().messages({
      "any.required": "Bed spaces is required for hotels",
    }),
    otherwise: Joi.number().integer().min(1).allow(null).optional(),
  }),

  facilities: Joi.array().items(Joi.string()).default([]),

  seatingCapacity: Joi.when("entityType", {
    is: Joi.valid(...DINING_LIKE).required(),
    then: Joi.number().integer().min(1).required().messages({
      "any.required": "Seating capacity is required for restaurants, bars, and lounges",
    }),
    otherwise: Joi.number().integer().min(1).allow(null).optional(),
  }),

  serviceTypes: Joi.array().items(Joi.string()).default([]),

  branches: Joi.array().items(Joi.object().unknown(true)).optional(),
}).unknown(false);

// Loose variant used for drafts — only entityType is required, everything
// else optional/nullable, since a Draft row can be almost empty.
export const draftEstablishmentSchema = Joi.object({
  entityType: Joi.string()
    .valid(...Object.values(EntityType))
    .required()
    .messages({
      "any.only": "Invalid business type selected",
      "any.required": "Business type is required",
    }),
  businessName: Joi.string().trim().max(200).allow("", null).optional(),
  businessPhoneNumber: Joi.string().trim().allow("", null).optional(),
  address: Joi.string().trim().max(500).allow("", null).optional(),
  localGovernment: Joi.string().valid(...LOCAL_GOVERNMENTS).allow(null).optional(),
  hasWebsite: Joi.boolean().optional(),
  website: Joi.string().trim().allow("", null).optional(),
  yearEstablished: Joi.number().integer().allow(null).optional(),
  contactName: Joi.string().trim().max(100).allow("", null).optional(),
  contactPhoneNumber: Joi.string().trim().allow("", null).optional(),
  contactEmail: Joi.string().trim().allow("", null).optional(),
  businessEmail: Joi.string().trim().allow("", null).optional(),
  roomCount: Joi.number().integer().allow(null).optional(),
  bedSpaces: Joi.number().integer().allow(null).optional(),
  facilities: Joi.array().items(Joi.string()).optional(),
  seatingCapacity: Joi.number().integer().allow(null).optional(),
  serviceTypes: Joi.array().items(Joi.string()).optional(),
  branches: Joi.array().items(Joi.object().unknown(true)).optional(),
}).unknown(false);

// Each item still carries its own entityType (same CreateEstablishmentPayload
// shape as a single create) — the top-level entityType is what the batch is
// declared as sharing, cross-checked against every item at the service layer
// rather than trusting the frontend sent them consistently.
export const bulkEstablishmentSchema = Joi.object({
  entityType: Joi.string()
    .valid(...Object.values(EntityType))
    .required(),
  establishments: Joi.array().items(establishmentSchema).min(1).max(500).required().messages({
    "array.min": "At least one establishment is required",
    "array.max": "Cannot submit more than 500 establishments at once",
    "any.required": "Establishments data is required",
  }),
});

export const bulkDraftEstablishmentSchema = Joi.object({
  entityType: Joi.string()
    .valid(...Object.values(EntityType))
    .required(),
  establishments: Joi.array().items(draftEstablishmentSchema).min(1).max(500).required(),
});

// Admin seeding, unlike the owner's own bulk-create, is not one form
// submission of a single entity type — the admin is re-keying a mixed batch
// of pre-existing records, so each item just carries its own entityType with
// no shared top-level one to cross-check against.
export const adminBulkAddEstablishmentSchema = Joi.object({
  establishments: Joi.array().items(establishmentSchema).min(1).max(500).required().messages({
    "array.min": "At least one establishment is required",
    "array.max": "Cannot submit more than 500 establishments at once",
    "any.required": "Establishments data is required",
  }),
});

export const branchSchema = Joi.object({
  businessName: Joi.string().trim().max(200).allow("", null).optional(),
  address: Joi.string().trim().max(500).required().messages({
    "any.required": "Branch address is required",
  }),
  localGovernment: Joi.string().valid(...LOCAL_GOVERNMENTS).required().messages({
    "any.required": "Branch local government is required",
    "any.only": "Invalid local government selected",
  }),
  businessPhoneNumber: phoneSchema.required().messages({
    "any.required": "Branch phone number is required",
  }),
  contactName: Joi.string().trim().max(100).required().messages({
    "any.required": "Branch contact name is required",
  }),
  contactPhoneNumber: phoneSchema.required().messages({
    "any.required": "Branch contact phone number is required",
  }),
  contactEmail: Joi.string().trim().email().required().messages({
    "any.required": "Branch contact email is required",
  }),
});

const ESTABLISHMENT_SCHEMA_KEYS = Object.keys(establishmentSchema.describe().keys ?? {});

/**
 * Keeps only the keys establishmentSchema actually recognizes. Needed before
 * validating anything that might carry the model's own bookkeeping fields
 * (id, ownerId, createdAt, …) — Joi's `unknown(false)` rejects those even
 * with `stripUnknown: true`, since that option only takes effect when the
 * schema doesn't already say `unknown(false)`.
 *
 * `dropNulls` additionally removes null-valued keys — useful when validating
 * a merged draft+incoming-body object, where a genuinely-missing field is
 * `null` (its column's default) rather than `undefined`, which would
 * otherwise fail a type check ("must be a string") instead of the clearer
 * "is required".
 */
export const pickEstablishmentFields = (
  source: Record<string, any>,
  dropNulls = false,
): Record<string, any> => {
  const picked: Record<string, any> = {};
  for (const key of ESTABLISHMENT_SCHEMA_KEYS) {
    const value = source[key];
    if (value === undefined) continue;
    if (dropNulls && value === null) continue;
    picked[key] = value;
  }
  return picked;
};

export const branchUpdateSchema = Joi.object({
  businessName: Joi.string().trim().max(200).allow("", null).optional(),
  address: Joi.string().trim().max(500).optional(),
  localGovernment: Joi.string().valid(...LOCAL_GOVERNMENTS).optional(),
  businessPhoneNumber: phoneSchema.optional(),
  contactName: Joi.string().trim().max(100).optional(),
  contactPhoneNumber: phoneSchema.optional(),
  contactEmail: Joi.string().trim().email().optional(),
}).min(1);

// Plain string only (rejects arrays/objects a query string can otherwise
// smuggle in, e.g. `?q[]=1&q[]=2`), bounded length — the value itself is
// still just data passed as a query parameter, never concatenated into SQL.
export const searchQuerySchema = Joi.object({
  q: Joi.string().trim().max(200).allow("").default(""),
  ...paginationSchemaFields,
}).unknown(false);

export const mineQuerySchema = Joi.object({
  ...paginationSchemaFields,
}).unknown(false);
