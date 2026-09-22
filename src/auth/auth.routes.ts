import express from "express";
import Joi from "joi";
import validate from "../configurations/validate";
import authenticate from "../configurations/authenticate";
import { limiter } from "../configurations/rate-limit";
import { NIGERIAN_PHONE_REGEX } from "../configurations/constants";
import { parseDateOfBirth } from "./auth.helpers";

import ninLookup from "./controllers/nin-lookup";
import register from "./controllers/register";
import verifyEmailOtp from "./controllers/verify-email-otp";
import resendEmailOtp from "./controllers/resend-email-otp";
import login from "./controllers/login";
import loginRequestOtp from "./controllers/login-request-otp";
import loginVerifyOtp from "./controllers/login-verify-otp";
import forgotPassword from "./controllers/forgot-password";
import resetPassword from "./controllers/reset-password";
import me from "./controllers/me";
import updateMe from "./controllers/update-me";
import changePassword from "./controllers/change-password";
import logout from "./controllers/logout";

const router = express.Router();

const emailSchema = Joi.string().trim().email().lowercase().required().messages({
  "string.email": "Invalid email format",
  "any.required": "Email is required",
});

const ninSchema = Joi.string()
  .trim()
  .length(11)
  .pattern(/^\d{11}$/)
  .required()
  .messages({
    "string.length": "NIN must be exactly 11 digits",
    "string.pattern.base": "NIN must contain only digits",
    "any.required": "NIN is required",
  });

const phoneSchema = Joi.string().trim().pattern(NIGERIAN_PHONE_REGEX).required().messages({
  "string.pattern.base": "Invalid Nigerian phone number. Format: 0803XXXXXXX or 234803XXXXXXX",
  "any.required": "Phone number is required",
});

const otpSchema = Joi.string().trim().length(6).pattern(/^\d{6}$/).required().messages({
  "string.length": "Code must be exactly 6 digits",
  "string.pattern.base": "Code must be exactly 6 digits",
  "any.required": "Code is required",
});

const passwordSchema = Joi.string().min(8).max(128).required().messages({
  "string.min": "Password must be at least 8 characters",
  "any.required": "Password is required",
});

const ninLookupSchema = Joi.object({ nin: ninSchema });

const registerSchema = Joi.object({
  nin: ninSchema,
  firstName: Joi.string().trim().min(1).max(100).required().messages({
    "any.required": "First name is required",
  }),
  lastName: Joi.string().trim().min(1).max(100).required().messages({
    "any.required": "Last name is required",
  }),
  // Accepts YYYY-MM-DD, DD-MM-YYYY, or DD/MM/YYYY (LumiID hands back
  // DD-MM-YYYY) and normalizes to YYYY-MM-DD for storage.
  dateOfBirth: Joi.string()
    .trim()
    .required()
    .custom((value, helpers) => {
      const parsed = parseDateOfBirth(value);
      if (!parsed) return helpers.error("any.invalid");
      return parsed;
    })
    .messages({
      "any.required": "Date of birth is required",
      "any.invalid": "Date of birth must be a valid date (e.g. 1992-10-31 or 31-10-1992)",
    }),
  email: emailSchema,
  phoneNumber: phoneSchema,
  password: passwordSchema,
});

const verifyEmailOtpSchema = Joi.object({ email: emailSchema, otp: otpSchema });
const resendEmailOtpSchema = Joi.object({ email: emailSchema });
const loginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required().messages({ "any.required": "Password is required" }),
});
const loginRequestOtpSchema = Joi.object({ email: emailSchema });
const loginVerifyOtpSchema = Joi.object({ email: emailSchema, otp: otpSchema });
const forgotPasswordSchema = Joi.object({ email: emailSchema });
const resetPasswordSchema = Joi.object({
  token: Joi.string().trim().required().messages({ "any.required": "Reset token is required" }),
  password: passwordSchema,
});
const updateMeSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(100).optional(),
  lastName: Joi.string().trim().min(1).max(100).optional(),
  phoneNumber: phoneSchema.optional(),
});
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({ "any.required": "Current password is required" }),
  newPassword: passwordSchema,
});

router.post("/nin-lookup", limiter, validate(ninLookupSchema), ninLookup);
router.post("/register", limiter, validate(registerSchema), register);
router.post("/verify-email-otp", limiter, validate(verifyEmailOtpSchema), verifyEmailOtp);
router.post("/resend-email-otp", limiter, validate(resendEmailOtpSchema), resendEmailOtp);
router.post("/login", limiter, validate(loginSchema), login);
router.post("/login/request-otp", limiter, validate(loginRequestOtpSchema), loginRequestOtp);
router.post("/login/verify-otp", limiter, validate(loginVerifyOtpSchema), loginVerifyOtp);
router.post("/forgot-password", limiter, validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", limiter, validate(resetPasswordSchema), resetPassword);
router.get("/me", authenticate, me);
router.patch("/me", authenticate, validate(updateMeSchema), updateMe);
router.post("/change-password", authenticate, validate(changePasswordSchema), changePassword);
router.post("/logout", authenticate, logout);

export default router;
