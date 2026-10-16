import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { User } from "../User";
import { compareHash, hashData } from "../auth.helpers";

const changePasswordService = errorUtilities.withServiceErrorHandling(
  async (userId: string, currentPassword: string, newPassword: string) => {
    const user = await User.findByPk(userId);

    if (!user || !user.get("password")) {
      throw errorUtilities.createError("User not found", StatusCodes.NOT_FOUND);
    }

    const isValid = await compareHash(currentPassword, user.get("password") as string);
    if (!isValid) {
      throw errorUtilities.createError("Current password is incorrect", StatusCodes.BAD_REQUEST);
    }

    // Clears the forced-change gate (set by the admin "send welcome email"
    // flow) the first time it's cleared via a real password change —
    // harmless no-op for accounts that never had it set.
    await user.update({ password: await hashData(newPassword), mustChangePassword: false });

    return responseUtilities.handleServicesResponse(StatusCodes.OK, "Password changed successfully");
  },
);

export default changePasswordService;
