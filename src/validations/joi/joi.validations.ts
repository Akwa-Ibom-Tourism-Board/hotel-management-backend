import Joi from "joi";
import { Request, Response, NextFunction } from "express";

const inputValidator = (schema: Joi.Schema): any => {
  return async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const { error }: any = schema.validate(request.body);
      if (error) {
        return response.status(400).json({
          status: "error",
          message: `${error.details[0].message.replace(/["\\]/g, "")}`,
        });
      }
      return next();
    } catch (err) {
      return response.status(500).json({
        status: "error",
        message: "Internal Server Error",
      });
    }
  };
};

// Nigerian phone number regex
const NIGERIAN_PHONE_REGEX = /^(0[789][01]\d{8}|234[789][01]\d{8})$/;

// URL regex
const URL_REGEX =
  /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

// Valid local governments in Akwa Ibom
const VALID_LOCAL_GOVERNMENTS = [
  "Abak",
  "Eastern Obolo",
  "Eket",
  "Esit Eket",
  "Essien Udim",
  "Etim Ekpo",
  "Etinan",
  "Ibeno",
  "Ibesikpo Asutan",
  "Ibiono Ibom",
  "Ika",
  "Ikono",
  "Ikot Abasi",
  "Ikot Ekpene",
  "Ini",
  "Itu",
  "Mbo",
  "Mkpat Enin",
  "Nsit Atai",
  "Nsit Ibom",
  "Nsit Ubium",
  "Obot Akara",
  "Okobo",
  "Onna",
  "Oron",
  "Oruk Anam",
  "Udung Uko",
  "Ukanafun",
  "Uruan",
  "Urue-Offong/Oruko",
  "Uyo",
];

// Valid entity types
const VALID_ENTITY_TYPES = [
  "hotel",
  "bar",
  "restaurant",
  "lounge",
  "tour_operator",
  "travel_agent",
  "hospitality_org",
  "other",
];

// Common hotel facilities
const VALID_HOTEL_FACILITIES = [
  "Board room",
  "Conference hall",
  "Swimming pool",
  "Basketball court",
  "Table tennis court",
  "Lawn tennis court",
  "Internet cyber cafe",
];

// Valid service types
const VALID_SERVICE_TYPES = [
  "Continental dishes",
  "Local/Nigerian dishes",
  "Inter-continental dishes",
  "Chinese",
  "Indian",
  "Italian",
  "Bakery/Pastries",
  "Fast food",
  "Seafood",
  "Grill/BBQ",
  "Cafe",
  "Local dishes",
];

// Business Registration Schema
const businessRegistrationSchema = Joi.object({
  // Common fields (required for all entity types)
  entityType: Joi.string()
    .valid(...VALID_ENTITY_TYPES)
    .required()
    .messages({
      "any.only": "Invalid business type selected",
      "any.required": "Business type is required",
    }),

  businessName: Joi.string().trim().min(2).max(200).required().messages({
    "string.empty": "Business name is required",
    "string.min": "Business name must be at least 2 characters",
    "string.max": "Business name cannot exceed 200 characters",
    "any.required": "Business name is required",
  }),

  businessPhoneNumber: Joi.string()
    .trim()
    .pattern(NIGERIAN_PHONE_REGEX)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid Nigerian phone number. Format: 0803XXXXXXX or 234803XXXXXXX",
      "string.empty": "Business phone number is required",
      "any.required": "Business phone number is required",
    }),

  phoneVerified: Joi.boolean().required().messages({
    "boolean.base": "Phone verification status is required",
    "any.required": "Phone verification status is required",
  }),

  address: Joi.string().trim().min(10).max(500).required().messages({
    "string.empty": "Full business address is required",
    "string.min": "Address must be at least 10 characters",
    "string.max": "Address cannot exceed 500 characters",
    "any.required": "Full business address is required",
  }),

  localGovernment: Joi.string()
    .valid(...VALID_LOCAL_GOVERNMENTS)
    .required()
    .messages({
      "any.only": "Invalid local government selected",
      "any.required": "Local government is required",
    }),

  hasWebsite: Joi.boolean().required().messages({
    "boolean.base": "Please indicate whether you have a website or not",
    "any.required": "Please indicate whether you have a website or not"
  }),

  website: Joi.when("hasWebsite", {
    is: true,
    then: Joi.string().trim().pattern(URL_REGEX).required().messages({
      "string.pattern.base": "Please enter a valid website URL",
      "string.empty": "Website URL is required when you have a website",
      "any.required": "Website URL is required when you have a website",
    }),
    otherwise: Joi.string().optional().allow(null, ""),
  }),

  yearEstablished: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .required()
    .messages({
      "number.base": "Year of establishment must be a number",
      "number.min": "Year must be 1900 or later",
      "number.max": `Year cannot be greater than ${new Date().getFullYear()}`,
      "any.required": "Year of establishment is required",
    }),

  contactName: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Contact name is required",
    "string.min": "Contact name must be at least 2 characters",
    "string.max": "Contact name cannot exceed 100 characters",
    "any.required": "Contact name is required",
  }),

  contactPhoneNumber: Joi.string().trim().pattern(NIGERIAN_PHONE_REGEX).required().messages({
    "string.pattern.base":
      "Invalid Nigerian phone number. Format: 0803XXXXXXX or 234803XXXXXXX",
    "string.empty": "Contact phone number is required",
    "any.required": "Contact phone number is required",
  }),

  contactEmail: Joi.string().trim().email().required().messages({
    "string.email": "Invalid contact email format",
    "string.empty": "Contact email address is required",
    "any.required": "Contact email address is required",
  }),

  businessEmail: Joi.string().trim().email().required().messages({
    "string.email": "Invalid business email format",
    "string.empty": "Business email address is required",
    "any.required": "Business email address is required",
  }),

  // Hotel-specific fields
  roomCount: Joi.when("entityType", {
    is: "hotel",
    then: Joi.number().integer().min(1).required().messages({
      "number.base": "Room count must be a number",
      "number.min": "Room count must be at least 1",
      "any.required": "Room count is required for hotels",
    }),
    otherwise: Joi.number().optional().allow(null),
  }),

  bedSpaces: Joi.when("entityType", {
    is: "hotel",
    then: Joi.number().integer().min(1).required().messages({
      "number.base": "Bed spaces must be a number",
      "number.min": "Bed spaces must be at least 1",
      "any.required": "Bed spaces is required for hotels",
    }),
    otherwise: Joi.number().optional().allow(null),
  }),

  facilities: Joi.when("entityType", {
    is: "hotel",
    then: Joi.array().items(Joi.string()).min(1).required().messages({
      "array.min": "Please select at least one facility",
      "any.required": "Facilities selection is required for hotels",
    }),
    otherwise: Joi.array().optional().allow(null),
  }),

  // Restaurant-specific fields
  seatingCapacity: Joi.when("entityType", {
    is: Joi.string().valid("restaurant"),
    then: Joi.number().integer().min(1).required().messages({
      "number.base": "Seating capacity must be a number",
      "number.min": "Seating capacity must be at least 1",
      "any.required": "Seating capacity is required for restaurants",
    }),
    otherwise: Joi.number().optional().allow(null),
  }),

  // Service types for restaurant, lounge, and bar
  serviceTypes: Joi.when("entityType", {
    is: Joi.string().valid("restaurant", "lounge", "bar"),
    then: Joi.array().items(Joi.string()).min(1).required().messages({
      "array.min": "Please select at least one service type",
      "any.required": "Service types selection is required",
    }),
    otherwise: Joi.array().optional().allow(null),
  }),

  // Other inputs for custom options
  // otherInputs: Joi.object()
  //   .pattern(Joi.string(), Joi.string())
  //   .optional()
  //   .messages({
  //     "object.base": "Other inputs must be an object",
  //   }),

  // Metadata
  submittedAt: Joi.date().iso().optional().messages({
    "date.format": "Invalid submission date format",
  }),
});

// Schema for sending OTP to business phone
const sendBusinessOtpSchema = Joi.object({
  businessPhoneNumber: Joi.string()
    .trim()
    .pattern(NIGERIAN_PHONE_REGEX)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid Nigerian phone number. Format: 0803XXXXXXX or 234803XXXXXXX",
      "string.empty": "Business phone number is required",
    }),
});

// Schema for verifying OTP
const verifyBusinessOtpSchema = Joi.object({
  businessPhoneNumber: Joi.string()
    .trim()
    .pattern(NIGERIAN_PHONE_REGEX)
    .required()
    .messages({
      "string.pattern.base": "Invalid Nigerian phone number",
      "string.empty": "Business phone number is required",
    }),
  otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    "string.length": "OTP must be exactly 6 digits",
    "string.pattern.base": "OTP must contain only numbers",
    "string.empty": "OTP is required",
  }),
});

// Schema for updating registration status (admin use)
const updateRegistrationStatusSchema = Joi.object({
  registrationStatus: Joi.string()
    .valid("pending", "approved", "rejected", "under_review")
    .required()
    .messages({
      "any.only": "Invalid registration status",
      "any.required": "Registration status is required",
    }),
  rejectionReason: Joi.when("registrationStatus", {
    is: "rejected",
    then: Joi.string().trim().min(10).required().messages({
      "string.empty":
        "Rejection reason is required when rejecting a registration",
      "string.min": "Rejection reason must be at least 10 characters",
    }),
    otherwise: Joi.string().optional().allow(null, ""),
  }),
});

export default {
  businessRegistrationSchema,
  sendBusinessOtpSchema,
  verifyBusinessOtpSchema,
  updateRegistrationStatusSchema,
  inputValidator,
};
