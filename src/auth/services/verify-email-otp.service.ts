import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { User } from "../User";
import { compareHash } from "../auth.helpers";

const verifyEmailOtpService = errorUtilities.withServiceErrorHandling(
  async (email: string, otp: string) => {
    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });

    if (!user || !user.get("emailOtpHash")) {
      throw errorUtilities.createError(
        "No verification code found for this email, please request a new one",
        StatusCodes.BAD_REQUEST,
      );
    }

    const expiresAt = user.get("emailOtpExpiresAt") as Date | null;
    if (!expiresAt || expiresAt.getTime() < Date.now()) {
      throw errorUtilities.createError(
        "Verification code has expired. Please request a new one.",
        StatusCodes.GONE,
      );
    }

    const isValid = await compareHash(otp, user.get("emailOtpHash") as string);
    if (!isValid) {
      throw errorUtilities.createError("Invalid verification code", StatusCodes.UNAUTHORIZED);
    }

    await user.update({
      emailVerified: true,
      emailOtpHash: null,
      emailOtpExpiresAt: null,
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Email verified successfully",
    );
  },
);

export default verifyEmailOtpService;
