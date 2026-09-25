import express from "express";
import { validateQuery, validateUuidParam } from "../../../configurations/validate";
import authenticate, { rolePermit } from "../../../configurations/authenticate";
import { Roles } from "../../../auth/User";
import { listAccountsQuerySchema, getAccountQuerySchema } from "./admin-users.routes";

import listAdmins from "./controllers/list-admins";
import getOne from "./controllers/get-one";

const router = express.Router();

router.use(authenticate, rolePermit([Roles.Admin]));

router.get("/", validateQuery(listAccountsQuerySchema), listAdmins);
router.get("/:id", validateUuidParam("id"), validateQuery(getAccountQuerySchema), getOne);

export default router;
