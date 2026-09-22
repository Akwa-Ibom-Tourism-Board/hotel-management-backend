import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { queueEmail } from "../../configurations/email-queue";
import { User } from "../User";
import { generateNumericOtp, hashData, compareHash } from "../auth.helpers";
import { loginOtpTemplate } from "../emailTemplates/loginOtp";
import { issueSession } from "./login.service";

const EMAIL_OTP_TTL_MS = 10 * 60 * 1000;

export const loginRequestOtpService = errorUtilities.withServiceErrorHandling(
  async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (user) {
      const otp = generateNumericOtp();

      await user.update({
        emailOtpHash: await hashData(otp),
        emailOtpExpiresAt: new Date(Date.now() + EMAIL_OTP_TTL_MS),
      });

      const template = loginOtpTemplate(otp);
      await queueEmail({ to: normalizedEmail, subject: template.subject, htmlBody: template.htmlBody });
    }

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "If an account with this email exists, a login code has been sent",
    );
  },
);

export const loginVerifyOtpService = errorUtilities.withServiceErrorHandling(
  async (email: string, otp: string) => {
    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });

    if (!user || !user.get("emailOtpHash")) {
      throw errorUtilities.createError(
        "No login code found for this email, please request a new one",
        StatusCodes.BAD_REQUEST,
      );
    }

    const expiresAt = user.get("emailOtpExpiresAt") as Date | null;
    if (!expiresAt || expiresAt.getTime() < Date.now()) {
      throw errorUtilities.createError(
        "Login code has expired. Please request a new one.",
        StatusCodes.GONE,
      );
    }

    const isValid = await compareHash(otp, user.get("emailOtpHash") as string);
    if (!isValid) {
      throw errorUtilities.createError("Invalid login code", StatusCodes.UNAUTHORIZED);
    }

    await user.update({ emailOtpHash: null, emailOtpExpiresAt: null, emailVerified: true });

    const session = await issueSession(user);

    return responseUtilities.handleServicesResponse(StatusCodes.OK, "Login successful", session);
  },
);
