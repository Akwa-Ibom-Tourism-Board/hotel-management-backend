import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import { StatusCodes } from "../../../../configurations/statusCodes";
import { User, Roles } from "../../../../auth/User";
import { compareHash } from "../../../../auth/auth.helpers";
import { issueSession } from "../../../../auth/services/login.service";

const adminLoginService = errorUtilities.withServiceErrorHandling(
  async (email: string, password: string) => {
    const admin = await User.findOne({
      where: { email: email.trim().toLowerCase(), role: Roles.Admin },
    });

    if (!admin || !admin.get("password")) {
      throw errorUtilities.createError("Invalid email or password", StatusCodes.UNAUTHORIZED);
    }

    const isValid = await compareHash(password, admin.get("password") as string);
    if (!isValid) {
      throw errorUtilities.createError("Invalid email or password", StatusCodes.UNAUTHORIZED);
    }

    const session = await issueSession(admin);

    return responseUtilities.handleServicesResponse(StatusCodes.OK, "Login successful", session);
  },
);

export default adminLoginService;
