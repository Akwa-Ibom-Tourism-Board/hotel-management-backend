import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import { StatusCodes } from "../../../../configurations/statusCodes";
import { User } from "../../../../auth/User";
import { serializeUser } from "../../../../auth/auth.helpers";

/** Re-activates the user's own login only. Deliberately does NOT cascade
 * back to their establishments — an admin may have separately disabled one
 * of them on its own merits, and re-enabling the user shouldn't silently
 * undo that. Re-enable each establishment individually if needed. */
const enableUserService = errorUtilities.withServiceErrorHandling(
  async (id: string) => {
    const user = await User.findByPk(id);

    if (!user) {
      throw errorUtilities.createError("User not found", StatusCodes.NOT_FOUND);
    }

    await user.update({ isActive: true });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "User re-enabled successfully",
      serializeUser(user),
    );
  },
);

export default enableUserService;
