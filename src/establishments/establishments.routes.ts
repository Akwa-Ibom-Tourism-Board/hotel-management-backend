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
import deleteBranch from "./controllers/delete-branch";

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
router.delete("/branches/:branchId", authenticate, validateUuidParam("branchId"), deleteBranch);

export default router;
