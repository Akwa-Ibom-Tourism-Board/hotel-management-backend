import express from "express";
import Joi from "joi";
import { validateQuery, validateUuidParam } from "../../../configurations/validate";
import authenticate, { rolePermit } from "../../../configurations/authenticate";
import { Roles } from "../../../auth/User";
import { EntityType, RegistrationStatus } from "../../../establishments/HospitalityEstablishment";
import { paginationSchemaFields } from "../../../configurations/pagination";

import list from "./controllers/list";
import getOne from "./controllers/get-one";

const router = express.Router();

router.use(authenticate, rolePermit([Roles.Admin]));

const listUsersQuerySchema = Joi.object({
  search: Joi.string().trim().max(200).allow("").optional(),
  role: Joi.string()
    .valid(...Object.values(Roles))
    .optional(),
  sortBy: Joi.string()
    .valid("fullName", "firstName", "lastName", "email", "createdAt", "updatedAt")
    .optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
  ...paginationSchemaFields,
}).unknown(false);

const getUserQuerySchema = Joi.object({
  search: Joi.string().trim().max(200).allow("").optional(),
  entityType: Joi.string()
    .valid(...Object.values(EntityType))
    .optional(),
  registrationStatus: Joi.string()
    .valid(...Object.values(RegistrationStatus))
    .optional(),
  sortBy: Joi.string()
    .valid("businessName", "entityType", "registrationStatus", "submittedAt", "createdAt")
    .optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
  ...paginationSchemaFields,
}).unknown(false);

router.get("/", validateQuery(listUsersQuerySchema), list);
router.get("/:id", validateUuidParam("id"), validateQuery(getUserQuerySchema), getOne);

export default router;
