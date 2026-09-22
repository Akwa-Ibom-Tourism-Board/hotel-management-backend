import { Op } from "sequelize";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { queueEmail } from "../../configurations/email-queue";
import { User, Roles } from "../User";
import { generateNumericOtp, hashData } from "../auth.helpers";
import { emailVerificationOtpTemplate } from "../emailTemplates/emailVerificationOtp";

const EMAIL_OTP_TTL_MS = 10 * 60 * 1000;

export interface RegisterPayload {
  nin: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phoneNumber: string;
  password: string;
}

const registerService = errorUtilities.withServiceErrorHandling(
  async (payload: RegisterPayload) => {
    const email = payload.email.trim().toLowerCase();

    const existing = await User.findOne({
      where: { [Op.or]: [{ email }, { nin: payload.nin }] },
    });

    if (existing) {
      throw errorUtilities.createError(
        existing.get("email") === email
          ? "An account with this email already exists"
          : "An account with this NIN already exists",
        StatusCodes.BAD_REQUEST,
      );
    }

    const otp = generateNumericOtp();

    await User.create({
      email,
      nin: payload.nin,
      firstName: payload.firstName,
      lastName: payload.lastName,
      dateOfBirth: payload.dateOfBirth,
      phoneNumber: payload.phoneNumber,
      password: await hashData(payload.password),
      role: Roles.User,
      emailVerified: false,
      emailOtpHash: await hashData(otp),
      emailOtpExpiresAt: new Date(Date.now() + EMAIL_OTP_TTL_MS),
    } as any);

    const template = emailVerificationOtpTemplate(otp);
    await queueEmail({
      to: email,
      subject: template.subject,
      htmlBody: template.htmlBody,
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.CREATED,
      "Account created, verification code sent",
      { email },
    );
  },
);

export default registerService;
