import express from "express";
import { adminController } from "../../controllers";
import { joiValidators } from "../../validations";
import {
  generalAuthFunction,
  rolePermit,
} from "../../middlewares/authorization.middleware";
import { Roles } from "../../types/userModelTypes";

const router = express.Router();

router.post(
  "/create-admin",
  joiValidators.inputValidator(joiValidators.addAdminSchema),
  adminController.addAdminController
);

router.post(
  "/login",
  joiValidators.inputValidator(joiValidators.loginAdminSchema),
  adminController.loginAdminController
);

router.get(
  "/establishments",
  generalAuthFunction,
  rolePermit([Roles.Admin]),
  adminController.getAllEstablishments
);

router.get(
  "/establishments/:establishmentId",
  generalAuthFunction,
  rolePermit([Roles.Admin]),
  adminController.getSingleEstablishment
);

router.patch(
  "/establishments/approve/:establishmentId",
  generalAuthFunction,
  rolePermit([Roles.Admin]),
  adminController.approveEntityRegistrationController
);

export default router;
