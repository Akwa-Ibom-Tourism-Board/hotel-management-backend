import express from "express";
import { establishmentController } from "../../controllers";
import { joiValidators } from "../../validations";

const router = express.Router();

router.post(
  "/register",
  joiValidators.inputValidator(joiValidators.businessRegistrationSchema),
  establishmentController.entityRegistrationController
);

export default router;
