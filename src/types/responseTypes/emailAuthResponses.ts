

export enum EmailAuthResponses {
    INVALID_EMAIL = "Invalid email",
    ALREADY_EXISTING_USER = "User already exists with this email",
    SUCCESFUL_CREATION = "User created successfully, an OTP has been sent to your mail for email verification",
    NOT_FOUND = "User not found or email does not exist. Please register",
    WRONG_LOGIN_METHOD = "It looks like you signed up with Google or Facebook. Please use that login method.",
    INVALID_OTP = "Invalid OTP. Please try again or request a new OTP",
    EXPIRED_OTP = "OTP expired. Please request a new OTP",
    VERIFIED_ACCOUNT = "Account verified successfully",
    UNVERIFIED_ACCOUNT = "Email is not verified. Please request a new OTP to verify your account",
    INCORRECT_PASSWORD = "Incorrect Password",
    WELCOME_BACK = "Welcome Back",
    ALREADY_VERIFIED = "Account already verified, please login",
    OTP_RESENT = "OTP has been resent successfully, please check your mail",
    BLOCKED_ACCOUNT = "Account Blocked, contact admin on eventyzze@gmail.com",
    ALREADY_LOGGED_IN = "Already logged in on another device",
    LOGOUT_MESSAGE = "Sad to see you go, but we believe you will be back soon"
}