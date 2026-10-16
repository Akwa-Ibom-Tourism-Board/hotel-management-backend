import express from "express";
import validate, { validateQuery, validateUuidParam } from "../configurations/validate";
import authenticate from "../configurations/authenticate";
import {
  establishmentSchema,
  draftEstablishmentSchema,
  bulkEstablishmentSchema,
  bulkDraftEstablishmentSchema,
  branchSchema,
  branchUpdateSchema,
  searchQuerySchema,
  mineQuerySchema,
  accommodationUpsertSchema,
  employmentStatsUpsertSchema,
  wageStatsUpsertSchema,
  guestArrivalStatsUpsertSchema,
  occupancyStatsUpsertSchema,
  reportingYearQuerySchema,
} from "./establishments.schemas";

import search from "./controllers/search";
import listMine from "./controllers/list-mine";
import getOne from "./controllers/get-one";
import create from "./controllers/create";
import update from "./controllers/update";
import bulkCreate from "./controllers/bulk-create";
import createDraft from "./controllers/create-draft";
import updateDraft from "./controllers/update-draft";
import submitDraft from "./controllers/submit-draft";
import bulkCreateDraft from "./controllers/bulk-create-draft";
import addBranch from "./controllers/add-branch";
import updateBranch from "./controllers/update-branch";
import * as accommodationSection from "./controllers/sections/accommodation";
import * as employmentStatsSection from "./controllers/sections/employment-stats";
import * as wageStatsSection from "./controllers/sections/wage-stats";
import * as guestArrivalsSection from "./controllers/sections/guest-arrivals";
import * as occupancySection from "./controllers/sections/occupancy";
import sectionsSummary from "./controllers/sections/summary";

const router = express.Router();

router.get("/search", authenticate, validateQuery(searchQuerySchema), search);
router.get("/mine", authenticate, validateQuery(mineQuerySchema), listMine);
router.get("/:id", authenticate, validateUuidParam("id"), getOne);

router.post("/", authenticate, validate(establishmentSchema), create);
router.patch("/:id", authenticate, validateUuidParam("id"), update);

router.post(
  "/bulk",
  authenticate,
  validate(bulkEstablishmentSchema),
  bulkCreate,
);

router.post(
  "/draft",
  authenticate,
  validate(draftEstablishmentSchema),
  createDraft,
);
router.patch(
  "/draft/:id",
  authenticate,
  validateUuidParam("id"),
  validate(draftEstablishmentSchema),
  updateDraft,
);
router.post("/draft/:id/submit", authenticate, validateUuidParam("id"), submitDraft);

router.post(
  "/bulk/draft",
  authenticate,
  validate(bulkDraftEstablishmentSchema),
  bulkCreateDraft,
);

router.post(
  "/:id/branches",
  authenticate,
  validateUuidParam("id"),
  validate(branchSchema),
  addBranch,
);
router.patch(
  "/branches/:branchId",
  authenticate,
  validateUuidParam("branchId"),
  validate(branchUpdateSchema),
  updateBranch,
);
// Branch deletion is admin-only (DELETE /admin/establishments/branches/:id) —
// not exposed to owners here.

router.get("/:id/sections-summary", authenticate, validateUuidParam("id"), sectionsSummary);

router.get("/:id/accommodation", authenticate, validateUuidParam("id"), accommodationSection.get);
router.put(
  "/:id/accommodation",
  authenticate,
  validateUuidParam("id"),
  validate(accommodationUpsertSchema),
  accommodationSection.put,
);

router.get(
  "/:id/employment-stats",
  authenticate,
  validateUuidParam("id"),
  validateQuery(reportingYearQuerySchema),
  employmentStatsSection.get,
);
router.put(
  "/:id/employment-stats",
  authenticate,
  validateUuidParam("id"),
  validate(employmentStatsUpsertSchema),
  employmentStatsSection.put,
);

router.get(
  "/:id/wage-stats",
  authenticate,
  validateUuidParam("id"),
  validateQuery(reportingYearQuerySchema),
  wageStatsSection.get,
);
router.put(
  "/:id/wage-stats",
  authenticate,
  validateUuidParam("id"),
  validate(wageStatsUpsertSchema),
  wageStatsSection.put,
);

router.get(
  "/:id/guest-arrivals",
  authenticate,
  validateUuidParam("id"),
  validateQuery(reportingYearQuerySchema),
  guestArrivalsSection.get,
);
router.put(
  "/:id/guest-arrivals",
  authenticate,
  validateUuidParam("id"),
  validate(guestArrivalStatsUpsertSchema),
  guestArrivalsSection.put,
);

router.get(
  "/:id/occupancy",
  authenticate,
  validateUuidParam("id"),
  validateQuery(reportingYearQuerySchema),
  occupancySection.get,
);
router.put(
  "/:id/occupancy",
  authenticate,
  validateUuidParam("id"),
  validate(occupancyStatsUpsertSchema),
  occupancySection.put,
);

export default router;
