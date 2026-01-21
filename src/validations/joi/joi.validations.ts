import Joi from "joi";
import { Request, Response, NextFunction } from "express";

// const inputValidator = (schema: Joi.Schema): any => {
//   return async (
//     request: Request,
//     response: Response,
//     next: NextFunction
//   ): Promise<any> => {
//     try {
//       const { error }: any = schema.validate(request.body);
//       if (error) {
//         return response.status(400).json({
//           status: "error",
//           message: `${error.details[0].message.replace(/["\\]/g, "")}`,
//         });
//       }
//       return next();
//     } catch (err) {
//       return response.status(500).json({
//         status: "error",
//         message: "Internal Server Error",
//       });
//     }
//   };
// };

// Nigerian phone number regex



const inputValidator = (schema: Joi.Schema): any => {
  return async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const { error, value } = schema.validate(request.body, {
        abortEarly: false, // Show all errors, not just the first one
        stripUnknown: true, // Remove unknown fields
      });
      console.log('Validation result:', { error, value });
      
      if (error) {
        // Format all error messages
        const errorMessages = error.details.map(detail => 
          detail.message.replace(/["\\]/g, '')
        );
        
        return response.status(400).json({
          status: "error",
          message: errorMessages[0], // First error for simple display
          errors: errorMessages, // All errors for detailed debugging
        });
      }
      
      // Replace request.body with validated/sanitized value
      request.body = value;
      return next();
    } catch (err: any) {
      console.error('Validation error:', err);
      return response.status(500).json({
        status: "error",
        message: "Internal Server Error during validation",
      });
    }
  };
};

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

  // phoneVerified: Joi.boolean().required().messages({
  //   "boolean.base": "Phone verification status is required",
  //   "any.required": "Phone verification status is required",
  // }),

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

const verifyBarCodeGeneratorSchema = Joi.object({
  url: Joi.string().required().messages({
    "string.empty": "Url is required",
  })
})

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


const addAdminSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Admin name is required",
    "string.min": "Admin name must be at least 2 characters",
    "string.max": "Admin name cannot exceed 100 characters",
    "any.required": "Admin name is required",
  }),

  email: Joi.string().trim().email().required().messages({
    "string.email": "Invalid admin email format",
    "string.empty": "Admin email address is required",
    "any.required": "Admin email address is required",
  }),

  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});

const loginAdminSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.email": "Invalid admin email format",
    "string.empty": "Admin email address is required",
    "any.required": "Admin email address is required",
  }),

  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});

const hotelSchema = Joi.object({
  // Common fields for all entities
  entityType: Joi.string()
    .valid('hotel', 'restaurant', 'bar', 'lounge', 'tour_operator', 'travel_agent', 'hospitality_org', 'other')
    .required()
    .messages({
      'any.required': 'Entity type is required',
      'any.only': 'Please select a valid entity type',
    }),

  businessName: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Business name is required',
      'string.min': 'Business name must be at least 2 characters',
      'string.max': 'Business name cannot exceed 200 characters',
      'any.required': 'Business name is required',
    }),

  businessPhoneNumber: Joi.string()
    .trim()
    .pattern(/^(0[789][01]\d{8}|234[789][01]\d{8})$/)
    .required()
    .messages({
      'string.empty': 'Business phone number is required',
      'string.pattern.base': 'Invalid Nigerian phone number. Format: 0803XXXXXXX or 234803XXXXXXX',
      'any.required': 'Business phone number is required',
    }),

  address: Joi.string()
    .trim()
    .min(5)
    .max(500)
    .required()
    .messages({
      'string.empty': 'Address is required',
      'string.min': 'Address must be at least 5 characters',
      'string.max': 'Address cannot exceed 500 characters',
      'any.required': 'Address is required',
    }),

  localGovernment: Joi.string()
    .valid(
      'Abak', 'Eastern Obolo', 'Eket', 'Esit Eket', 'Essien Udim',
      'Etim Ekpo', 'Etinan', 'Ibeno', 'Ibesikpo Asutan', 'Ibiono Ibom',
      'Ika', 'Ikono', 'Ikot Abasi', 'Ikot Ekpene', 'Ini', 'Itu',
      'Mbo', 'Mkpat Enin', 'Nsit Atai', 'Nsit Ibom', 'Nsit Ubium',
      'Obot Akara', 'Okobo', 'Onna', 'Oron', 'Oruk Anam',
      'Udung Uko', 'Ukanafun', 'Uruan', 'Urue-Offong/Oruko', 'Uyo'
    )
    .required()
    .messages({
      'any.only': 'Please select a valid local government',
      'any.required': 'Local government is required',
    }),

  hasWebsite: Joi.boolean()
    .default(false),

  website: Joi.when('hasWebsite', {
    is: true,
    then: Joi.string()
      .trim()
      .uri({ scheme: ['http', 'https'] })
      .required()
      .messages({
        'string.uri': 'Please enter a valid website URL',
        'any.required': 'Website URL is required when hasWebsite is true',
      }),
    otherwise: Joi.string().allow('', null).optional()
  }),

  yearEstablished: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .required()
    .messages({
      'number.base': 'Year must be a number',
      'number.min': 'Year must be between 1900 and current year',
      'number.max': 'Year must be between 1900 and current year',
      'any.required': 'Year established is required',
    }),

  contactName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Contact name is required',
      'string.min': 'Contact name must be at least 2 characters',
      'string.max': 'Contact name cannot exceed 100 characters',
      'any.required': 'Contact name is required',
    }),

  contactPhoneNumber: Joi.string()
    .trim()
    .pattern(/^(0[789][01]\d{8}|234[789][01]\d{8})$/)
    .required()
    .messages({
      'string.empty': 'Contact phone number is required',
      'string.pattern.base': 'Invalid Nigerian phone number. Format: 0803XXXXXXX or 234803XXXXXXX',
      'any.required': 'Contact phone number is required',
    }),

  contactEmail: Joi.string()
    .trim()
    .email()
    .required()
    .messages({
      'string.email': 'Invalid email format',
      'string.empty': 'Contact email is required',
      'any.required': 'Contact email is required',
    }),

  businessEmail: Joi.string()
    .trim()
    .email()
    .required()
    .messages({
      'string.email': 'Invalid email format',
      'string.empty': 'Business email is required',
      'any.required': 'Business email is required',
    }),

  // Hotel-specific fields - REMOVE .required() before .when()
  roomCount: Joi.when('entityType', {
    is: 'hotel',
    then: Joi.number()
      .integer()
      .min(1)
      .required()
      .messages({
        'number.base': 'Room count must be a number',
        'number.min': 'Room count must be at least 1',
        'any.required': 'Room count is required for hotels',
      }),
    otherwise: Joi.number().integer().min(1).allow(null).optional()
  }),

  bedSpaces: Joi.when('entityType', {
    is: 'hotel',
    then: Joi.number()
      .integer()
      .min(1)
      .required()
      .messages({
        'number.base': 'Bed spaces must be a number',
        'number.min': 'Bed spaces must be at least 1',
        'any.required': 'Bed spaces is required for hotels',
      }),
    otherwise: Joi.number().integer().min(1).allow(null).optional()
  }),

  facilities: Joi.array()
    .items(
      Joi.string().valid(
        'Board room',
        'Conference hall',
        'Swimming pool',
        'Basketball court',
        'Table tennis court',
        'Lawn tennis court',
        'Internet cyber cafe'
      )
    ).default([]),

  facilitiesOther: Joi.string()
    .trim()
    .max(200)
    .allow('', null)
    .optional(),

  // Restaurant/Bar/Lounge fields
  seatingCapacity: Joi.when('entityType', {
    is: Joi.valid('restaurant', 'bar', 'lounge'),
    then: Joi.number()
      .integer()
      .min(1)
      .required()
      .messages({
        'number.base': 'Seating capacity must be a number',
        'number.min': 'Seating capacity must be at least 1',
        'any.required': 'Seating capacity is required for restaurants, bars, and lounges',
      }),
    otherwise: Joi.number().integer().min(1).allow(null).optional()
  }),

  serviceTypes: Joi.array()
    .items(
      Joi.string().valid(
        'Continental dishes',
        'Local/Nigerian dishes',
        'Inter-continental dishes',
        'Chinese',
        'Indian',
        'Italian',
        'Bakery/Pastries',
        'Fast food',
        'Seafood',
        'Grill/BBQ',
        'Cafe'
      )
    )
    .default([]),

  serviceTypesOther: Joi.string()
    .trim()
    .max(200)
    .allow('', null)
    .optional(),

  description: Joi.string()
    .trim()
    .max(1000)
    .allow('', null)
    .optional(),

  submittedAt: Joi.date()
    .default(Date.now),
}).unknown(false);

// Validation for bulk submission
const bulkHotelSchema = Joi.object({
  establishments: Joi.array()
    .items(hotelSchema)
    .min(1)
    .max(500) // Add a reasonable max limit
    .required()
    .messages({
      'array.base': 'Establishments must be an array',
      'array.min': 'At least one establishment is required',
      'array.max': 'Cannot submit more than 500 establishments at once',
      'any.required': 'Establishments data is required',
    }),
});


export default {
  businessRegistrationSchema,
  sendBusinessOtpSchema,
  verifyBusinessOtpSchema,
  updateRegistrationStatusSchema,
  verifyBarCodeGeneratorSchema,
  addAdminSchema,
  loginAdminSchema,
  inputValidator,
  bulkHotelSchema
};
