import express from "express";
import { establishmentController } from "../../controllers";
import { joiValidators } from "../../validations";

const router = express.Router();

router.post(
  "/register",
  joiValidators.inputValidator(joiValidators.businessRegistrationSchema),
  establishmentController.entityRegistrationController
);
router.post(
  "/send-registration-otp",
  joiValidators.inputValidator(joiValidators.sendBusinessOtpSchema),
  establishmentController.sendRegistrationOTPController
);

router.post(
  "/verify-registration-otp",
  joiValidators.inputValidator(joiValidators.verifyBusinessOtpSchema),
  establishmentController.verifyRegistrationOTPController
);

router.post(
  "/generate-url-barcode",
  joiValidators.inputValidator(joiValidators.verifyBarCodeGeneratorSchema),
  establishmentController.downloadLinkAsQrCode
);
export default router;
