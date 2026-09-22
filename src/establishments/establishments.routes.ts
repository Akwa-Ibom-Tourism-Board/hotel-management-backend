import express from "express";
import validate, { validateQuery } from "../configurations/validate";
import authenticate from "../configurations/authenticate";
import {
  establishmentSchema,
  draftEstablishmentSchema,
  bulkEstablishmentSchema,
  bulkDraftEstablishmentSchema,
  branchSchema,
  branchUpdateSchema,
  searchQuerySchema,
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
router.get("/mine", authenticate, listMine);
router.get("/:id", authenticate, getOne);

router.post("/", authenticate, validate(establishmentSchema), create);
router.patch("/:id", authenticate, update);

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
  validate(draftEstablishmentSchema),
  updateDraft,
);
router.post("/draft/:id/submit", authenticate, submitDraft);

router.post(
  "/bulk/draft",
  authenticate,
  validate(bulkDraftEstablishmentSchema),
  bulkCreateDraft,
);

router.post("/:id/branches", authenticate, validate(branchSchema), addBranch);
router.patch(
  "/branches/:branchId",
  authenticate,
  validate(branchUpdateSchema),
  updateBranch,
);
router.delete("/branches/:branchId", authenticate, deleteBranch);

export default router;
