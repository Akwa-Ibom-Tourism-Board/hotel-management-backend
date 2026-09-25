import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import jwtUtilities, { TokenDuration } from "../../configurations/jwt";
import { User } from "../User";
import { compareHash, serializeUser } from "../auth.helpers";

const issueSession = async (user: User) => {
  const tokenPayload = {
    id: user.get("id") as string,
    email: user.get("email") as string,
    role: user.get("role") as string,
  };

  const token = jwtUtilities.signToken(
    tokenPayload,
    TokenDuration.accessTokenDuration,
  );
  const refreshToken = jwtUtilities.signToken(
    tokenPayload,
    TokenDuration.refreshTokenDuration,
  );

  await user.update({ refreshToken });

  return { token, refreshToken, user: serializeUser(user) };
};

const loginService = errorUtilities.withServiceErrorHandling(
  async (email: string, password: string) => {
    const user = await User.findOne({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user || !user.get("password")) {
      throw errorUtilities.createError(
        "Invalid email or password",
        StatusCodes.BAD_REQUEST,
      );
    }

    const isValid = await compareHash(password, user.get("password") as string);
    if (!isValid) {
      throw errorUtilities.createError(
        "Invalid email or password",
        StatusCodes.BAD_REQUEST,
      );
    }

    if (!user.get("emailVerified")) {
      throw errorUtilities.createError(
        "Please verify your email before logging in",
        StatusCodes.FORBIDDEN,
      );
    }

    const session = await issueSession(user);

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Login successful",
      session,
    );
  },
);

export default loginService;
export { issueSession };
