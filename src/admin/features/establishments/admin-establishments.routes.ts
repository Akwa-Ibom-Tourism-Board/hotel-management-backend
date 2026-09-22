import express from "express";
import Joi from "joi";
import validate, { validateQuery } from "../../../configurations/validate";
import authenticate, { rolePermit } from "../../../configurations/authenticate";
import { Roles } from "../../../auth/User";
import { EntityType, RegistrationStatus } from "../../../establishments/HospitalityEstablishment";

import list from "./controllers/list";
import getOne from "./controllers/get-one";
import approve from "./controllers/approve";
import reject from "./controllers/reject";
import update from "./controllers/update";
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

const listQuerySchema = Joi.object({
  registrationStatus: Joi.string()
    .valid(...Object.values(RegistrationStatus))
    .optional(),
  entityType: Joi.string()
    .valid(...Object.values(EntityType))
    .optional(),
  search: Joi.string().trim().max(200).allow("").optional(),
}).unknown(false);

// Registered before "/:id" — otherwise the single-segment :id param would
// swallow this literal path first.
router.get("/analytics-data", analyticsSummary);

router.get("/", validateQuery(listQuerySchema), list);
router.get("/:id", getOne);
router.patch("/:id/approve", approve);
router.patch("/:id/reject", validate(rejectSchema), reject);
router.patch("/:id", update);

export default router;
