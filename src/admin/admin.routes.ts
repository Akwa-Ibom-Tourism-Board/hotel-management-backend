import express from "express";
import authenticate, { rolePermit } from "../configurations/authenticate";
import validate from "../configurations/validate";
import { Roles } from "../auth/User";
import { bulkEstablishmentSchema } from "../establishments/establishments.schemas";

import adminAuthRouter from "./features/auth/admin-auth.routes";
import adminEstablishmentsRouter from "./features/establishments/admin-establishments.routes";
import bulkAdd from "./features/establishments/controllers/bulk-add";

const router = express.Router();

router.use("/", adminAuthRouter);
router.use("/establishments", adminEstablishmentsRouter);

router.post(
  "/bulk-add-establishments",
  authenticate,
  rolePermit([Roles.Admin]),
  validate(bulkEstablishmentSchema),
  bulkAdd,
);

export default router;
