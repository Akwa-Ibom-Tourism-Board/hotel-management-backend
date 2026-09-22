import express from "express";
import Joi from "joi";
import validate from "../../../configurations/validate";
import authenticate from "../../../configurations/authenticate";
import { rolePermit } from "../../../configurations/authenticate";
import { limiter } from "../../../configurations/rate-limit";
import { Roles } from "../../../auth/User";
import login from "./controllers/login";
import createAdmin from "./controllers/create-admin";

const router = express.Router();

const loginSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().required().messages({
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({ "any.required": "Password is required" }),
});

const createAdminSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required().messages({
    "any.required": "Admin name is required",
  }),
  email: Joi.string().trim().email().lowercase().required().messages({
    "any.required": "Admin email is required",
  }),
  password: Joi.string().min(8).max(128).required().messages({
    "string.min": "Password must be at least 8 characters",
    "any.required": "Password is required",
  }),
});

router.post("/login", limiter, validate(loginSchema), login);
router.post(
  "/create-admin",
  authenticate,
  rolePermit([Roles.Admin]),
  validate(createAdminSchema),
  createAdmin,
);

export default router;
