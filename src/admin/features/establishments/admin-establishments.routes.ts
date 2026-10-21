import express from "express";
import Joi from "joi";
import validate, { validateQuery, validateUuidParam } from "../../../configurations/validate";
import authenticate, { rolePermit } from "../../../configurations/authenticate";
import { Roles } from "../../../auth/User";
import { EntityType, RegistrationStatus } from "../../../establishments/HospitalityEstablishment";
import { paginationSchemaFields } from "../../../configurations/pagination";
import {
  accommodationUpsertSchema,
  employmentStatsUpsertSchema,
  wageStatsUpsertSchema,
  guestArrivalStatsUpsertSchema,
  occupancyStatsUpsertSchema,
  roomRateUpsertSchema,
  reportingYearQuerySchema,
} from "../../../establishments/establishments.schemas";

import list from "./controllers/list";
import getOne from "./controllers/get-one";
import approve from "./controllers/approve";
import reject from "./controllers/reject";
import update from "./controllers/update";
import disable from "./controllers/disable";
import enable from "./controllers/enable";
import sendWelcomeEmail from "./controllers/send-welcome-email";
import deleteBranch from "./controllers/delete-branch";
import * as accommodationSection from "./controllers/sections/accommodation";
import * as employmentStatsSection from "./controllers/sections/employment-stats";
import * as wageStatsSection from "./controllers/sections/wage-stats";
import * as guestArrivalsSection from "./controllers/sections/guest-arrivals";
import * as occupancySection from "./controllers/sections/occupancy";
import * as roomRatesSection from "./controllers/sections/room-rates";
import sectionsSummary from "./controllers/sections/summary";
import analyticsSummary from "../analytics/controllers/summary";

const router = express.Router();

router.use(authenticate, rolePermit([Roles.Admin]));

const rejectSchema = Joi.object({
  rejectionReason: Joi.string().trim().min(10).required().messages({
    "string.empty": "Rejection reason is required when rejecting a registration",
    "string.min": "Rejection reason must be at least 10 characters",
    "any.required": "Rejection reason is required when rejecting a registration",
  }),
});

const disableSchema = Joi.object({
  reason: Joi.string().trim().max(500).allow("", null).optional(),
});

const listQuerySchema = Joi.object({
  registrationStatus: Joi.string()
    .valid(...Object.values(RegistrationStatus))
    .optional(),
  entityType: Joi.string()
    .valid(...Object.values(EntityType))
    .optional(),
  search: Joi.string().trim().max(200).allow("").optional(),
  // Filters behind the two new sidebar menus: establishments with an owner
  // linked, and hotels that have any Sections data at all.
  claimed: Joi.boolean().optional(),
  sectionsStarted: Joi.boolean().optional(),
  ...paginationSchemaFields,
}).unknown(false);

// Registered before "/:id" — otherwise the single-segment :id param would
// swallow this literal path first.
router.get("/analytics-data", analyticsSummary);

// Two-segment path, no collision with "/:id" regardless of registration
// order — admin-only branch deletion (owners can't delete branches at all).
router.delete("/branches/:id", validateUuidParam("id"), deleteBranch);

router.get("/", validateQuery(listQuerySchema), list);
router.get("/:id", validateUuidParam("id"), getOne);
router.patch("/:id/approve", validateUuidParam("id"), approve);
router.patch("/:id/reject", validateUuidParam("id"), validate(rejectSchema), reject);
router.patch("/:id/disable", validateUuidParam("id"), validate(disableSchema), disable);
router.patch("/:id/enable", validateUuidParam("id"), enable);
router.post("/:id/send-welcome-email", validateUuidParam("id"), sendWelcomeEmail);
router.patch("/:id", validateUuidParam("id"), update);

router.get("/:id/sections-summary", validateUuidParam("id"), sectionsSummary);

router.get("/:id/accommodation", validateUuidParam("id"), accommodationSection.get);
router.put(
  "/:id/accommodation",
  validateUuidParam("id"),
  validate(accommodationUpsertSchema),
  accommodationSection.put,
);

router.get(
  "/:id/employment-stats",
  validateUuidParam("id"),
  validateQuery(reportingYearQuerySchema),
  employmentStatsSection.get,
);
router.put(
  "/:id/employment-stats",
  validateUuidParam("id"),
  validate(employmentStatsUpsertSchema),
  employmentStatsSection.put,
);

router.get(
  "/:id/wage-stats",
  validateUuidParam("id"),
  validateQuery(reportingYearQuerySchema),
  wageStatsSection.get,
);
router.put(
  "/:id/wage-stats",
  validateUuidParam("id"),
  validate(wageStatsUpsertSchema),
  wageStatsSection.put,
);

router.get(
  "/:id/guest-arrivals",
  validateUuidParam("id"),
  validateQuery(reportingYearQuerySchema),
  guestArrivalsSection.get,
);
router.put(
  "/:id/guest-arrivals",
  validateUuidParam("id"),
  validate(guestArrivalStatsUpsertSchema),
  guestArrivalsSection.put,
);

router.get(
  "/:id/occupancy",
  validateUuidParam("id"),
  validateQuery(reportingYearQuerySchema),
  occupancySection.get,
);
router.put(
  "/:id/occupancy",
  validateUuidParam("id"),
  validate(occupancyStatsUpsertSchema),
  occupancySection.put,
);

router.get(
  "/:id/room-rates",
  validateUuidParam("id"),
  validateQuery(reportingYearQuerySchema),
  roomRatesSection.get,
);
router.put(
  "/:id/room-rates",
  validateUuidParam("id"),
  validate(roomRateUpsertSchema),
  roomRatesSection.put,
);

export default router;
