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

router.post(
  "/bulk-add-establishments",
  generalAuthFunction,
  rolePermit([Roles.Admin]),
  joiValidators.inputValidator(joiValidators.singleOrBulkHotelSchema),
  adminController.bulkEntityRegistrationController
);

router.get(
  "/establishments",
  generalAuthFunction,
  rolePermit([Roles.Admin]),
  adminController.getAllEstablishments
);

router.get(
  "/establishments/analytics-data",
  generalAuthFunction,
  rolePermit([Roles.Admin]),
  adminController.getEntityAnalyticsDataController
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

router.patch(
  "/establishments/:establishmentId",
  generalAuthFunction,
  rolePermit([Roles.Admin]),
  adminController.updateEstablishmentController,
);

export default router;
