import express from "express";
import Joi from "joi";
import { validateQuery, validateUuidParam } from "../../../configurations/validate";
import authenticate, { rolePermit } from "../../../configurations/authenticate";
import { Roles } from "../../../auth/User";
import { EntityType, RegistrationStatus } from "../../../establishments/HospitalityEstablishment";
import { paginationSchemaFields } from "../../../configurations/pagination";

import listUsers from "./controllers/list-users";
import getOne from "./controllers/get-one";

const router = express.Router();

router.use(authenticate, rolePermit([Roles.Admin]));

// role is NOT a client-settable filter here — this route is fixed to
// role: user by its controller; use /admin/admins to list admins instead.
export const listAccountsQuerySchema = Joi.object({
  search: Joi.string().trim().max(200).allow("").optional(),
  sortBy: Joi.string()
    .valid("fullName", "firstName", "lastName", "email", "createdAt", "updatedAt")
    .optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
  ...paginationSchemaFields,
}).unknown(false);

export const getAccountQuerySchema = Joi.object({
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

router.get("/", validateQuery(listAccountsQuerySchema), listUsers);
router.get("/:id", validateUuidParam("id"), validateQuery(getAccountQuerySchema), getOne);

export default router;
