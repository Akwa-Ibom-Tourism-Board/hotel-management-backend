import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import { StatusCodes } from "../../../../configurations/statusCodes";
import { User, Roles } from "../../../../auth/User";
import { hashData, serializeUser } from "../../../../auth/auth.helpers";

const createAdminService = errorUtilities.withServiceErrorHandling(
  async (payload: { fullName: string; email: string; password: string }) => {
    const email = payload.email.trim().toLowerCase();
    const existing = await User.findOne({ where: { email } });

    if (existing) {
      throw errorUtilities.createError("An account with this email already exists", StatusCodes.BAD_REQUEST);
    }

    const admin = await User.create({
      fullName: payload.fullName,
      email,
      password: await hashData(payload.password),
      role: Roles.Admin,
      emailVerified: true,
    } as any);

    return responseUtilities.handleServicesResponse(
      StatusCodes.CREATED,
      "Admin account created successfully",
      serializeUser(admin),
    );
  },
);

export default createAdminService;
