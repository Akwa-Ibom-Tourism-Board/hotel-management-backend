import { ResponseDetails } from "../../types/generalTypes";
import { errorUtilities, mailUtilities } from "../../utilities";
import validator from "validator";
import { JwtPayload } from "jsonwebtoken";
import { userRepositories } from "../../repositories";
import { UserAttributes } from "../../types/userModelTypes";
import { generalHelpers } from "../../helpers";
import { Op } from "sequelize";
import handleServicesResponse from "../../utilities/responseHandlers/response.utilities";
// import { EmailConstants, StatusCodes } from "../../constants";
import { StatusCodes } from "../../constants";
import { UserResponses } from "../../types/responseTypes/userServiceResponses";

// const userProfileUpdateService = errorUtilities.withServiceErrorHandling(
//   async (profilePayload: Record<string, any>): Promise<Record<string, any>> => {
//     const { body } = profilePayload;

//     const { id } = profilePayload;

//     const user: any = await userRepositories.userRepositories.getOne({ id });

//     if (
//       (!body.userName || body.userName === "") &&
//       (!body.bio || body.bio === "") &&
//       (!body.interests ||
//         !Array.isArray(body.interests) ||
//         body.interests.length === 0) &&
//       (!body.phone || body.phone === "") &&
//       (!body.fullName || body.fullName === "") &&
//       (!body.address || body.address === "")
//     ) {
//       throw errorUtilities.createError(
//         UserResponses.SELECT_A_FIELD,
//         StatusCodes.BadRequest
//       );
//     }

//     let updateDetails: Record<string, any> = {};

//     if (body.userName) {
//       if (body.userName === user.userName) {
//         throw errorUtilities.createError(
//           UserResponses.SELECT_DIFFERENT_USERNAME,
//            StatusCodes.BadRequest
//         );
//       }
//       const confirmUserName = await userRepositories.userRepositories.getOne(
//         { userName: body.userName },
//         [DatabaseConstants.DatabaseProjection.USERNAME]
//       );

//       if (confirmUserName) {
//         throw errorUtilities.createError(
//           UserResponses.UNAVAILABLE_USER_NAME,
//           StatusCodes.StatusCodes.BAD_REQUEST
//         );
//       }

//       updateDetails.userName = body.userName;
//     }

//     if (body.bio) {
//       updateDetails.bio = body.bio.trim();
//     }

//     if (body.interests) {
//       updateDetails.interests = body.interests;
//     }

//     if (body.phone) {
//       if (!validator.isMobilePhone(body.phone, "any")) {
//         throw errorUtilities.createError(
//           UserResponses.INVALID_PHONE,
//           StatusCodes.StatusCodes.BAD_REQUEST
//         );
//       }
//       updateDetails.phone = body.phone.trim();
//     }

//     if (body.fullName) {
//       updateDetails.fullName = body.fullName.trim();
//     }

//     if (body.country) {
//       updateDetails.country = body.country.trim();
//     }

//     if (body.state) {
//       updateDetails.country = body.country.trim();
//     }

//     if (body.address) {
//       updateDetails.address = body.address.trim();
//     }

//     const newUser = await userRepositories.userRepositories.updateOne(
//       { id },
//       updateDetails
//     );

//     return handleServicesResponse.handleServicesResponse(
//       StatusCodes.StatusCodes.OK,
//       UserResponses.SUCCESSFULY_PROFILE_CREATION,
//       newUser
//     );
//   }
// );

// const updateUserImageService = errorUtilities.withServiceErrorHandling(
//   async (imageUrl: string, id: string): Promise<any> => {
//     if (!imageUrl) {
//       throw errorUtilities.createError(
//         UserResponses.SELECT_AN_IMAGE,
//         StatusCodes.BadRequest
//       );
//     }

//     const newUserImage: any = await userRepositories.userRepositories.updateOne(
//       {
//         id,
//       },
//       {
//         userImage: imageUrl,
//       }
//     );
//     return handleServicesResponse.handleServicesResponse(
//       StatusCodes.StatusCodes.OK,
//       UserResponses.USER_IMAGE_UPDATE_SUCCESS,
//       newUserImage
//     );
//   }
// );

// const userfirstimeProfileUpdateService = errorUtilities.withServiceErrorHandling(
//   async (profilePayload: Record<string, any>): Promise<Record<string, any>> => {
//     let {
//       id,
//       userName,
//       bio,
//       interests,
//       phone,
//       fullName,
//       state,
//       country,
//       address,
//       stateCode,
//       countryCode,
//       deviceId,
//     } = profilePayload;

//     const user = (await userRepositories.userRepositories.getOne({
//       id,
//     })) as unknown as UserAttributes;

//     if (!user) {
//       throw errorUtilities.createError(
//         UserResponses.NOT_FOUND,
//         StatusCodes.StatusCodes.NOT_FOUND
//       );
//     }

//     if (!validator.isMobilePhone(phone, "any")) {
//       throw errorUtilities.createError(
//         UserResponses.INVALID_PHONE,
//         StatusCodes.StatusCodes.BAD_REQUEST
//       );
//     }
//     let userEventyzzeId;

//     try {
//       userEventyzzeId = await generalHelpers.generateUniqueUserEventyzzeId(
//         countryCode,
//         stateCode
//       );
//     } catch (error) {
//       throw errorUtilities.createError(
//         UserResponses.EVENTYZZE_ID_GENERATE_FAILURE,
//         StatusCodes.StatusCodes.INTERNAL_SERVER_ERROR
//       );
//     }

//     const tokenPayload = {
//       id: user.id,
//       email: user.email,
//       role: user.role,
//     };

//     const accessToken = await generalHelpers.generateTokens(tokenPayload, "2h");
//     const refreshToken = await generalHelpers.generateTokens(
//       tokenPayload,
//       "30d"
//     );

//     if (!user.refreshToken || !user.isInitialProfileSetupDone) {
//       let mailMessage = EmailConstants.generateMessages().FIRST_PROFILE_UPDATE_SUCCESSFUL(user.fullName)

//       let mailSubject = `${EmailConstants.MailSubjects.WELCOME} ${user.fullName ? user.fullName : ""
//         }`;
//       await mailUtilities.sendMail(user.email, mailMessage, mailSubject);
//     }

//     profilePayload.eventyzzeId = userEventyzzeId;

//     profilePayload.isInitialProfileSetupDone = true;

//     profilePayload.refreshToken = refreshToken;

//     profilePayload.activeDeviceId = deviceId;

//     const newUser = await userRepositories.userRepositories.updateOne(
//       { id },
//       profilePayload
//     );

//     const userData = { user: newUser, accessToken, refreshToken };

//     return handleServicesResponse.handleServicesResponse(
//       StatusCodes.StatusCodes.OK,
//       UserResponses.SUCCESSFULY_PROFILE_CREATION,
//       userData
//     );
//   }
// );

// const confirmUserNameService = errorUtilities.withServiceErrorHandling(
//   async (userName: string) => {
//     const confirmUserName = await userRepositories.userRepositories.getOne(
//       { userName },
//       [DatabaseConstants.DatabaseProjection.USERNAME]
//     );

//     if (confirmUserName) {
//       throw errorUtilities.createError(
//         UserResponses.UNAVAILABLE_USER_NAME,
//         StatusCodes.StatusCodes.BAD_REQUEST
//       );
//     }
//     return handleServicesResponse.handleServicesResponse(
//       StatusCodes.StatusCodes.OK,
//       UserResponses.AVAILABLE_USERNAME
//     );
//   }
// );

const userSwitchesToHostService = errorUtilities.withServiceErrorHandling(
  async (userPayload: Record<string, any>): Promise<Record<string, any>> => {
    return handleServicesResponse.handleServicesResponse(
      StatusCodes.OK,
      UserResponses.AVAILABLE_USERNAME
    );
  }
);

// const getAllLiveEventsService = errorUtilities.withServiceErrorHandling(
//   async (): Promise<Record<string, any>> => {
//     const projection = [
//       DatabaseConstants.DatabaseProjection.ID,
//       DatabaseConstants.DatabaseProjection.EVENT_TITLE,
//       DatabaseConstants.DatabaseProjection.EVENT_OWNER_NAME,
//       DatabaseConstants.DatabaseProjection.EVENT_COVER_IMAGE,
//       DatabaseConstants.DatabaseProjection.EVENT_IS_LIVE,
//     ];
//     const events: any = await eventRepositories.eventRepositories.getMany(
//       {
//         // isLive: true,
//       },
//       projection
//     );

//     if (!events) {
//       throw errorUtilities.createError(
//         UserResponses.UNABLE_TO_FETCH_EVENTS,
//         StatusCodes.StatusCodes.NOT_FOUND
//       );
//     }
//     return handleServicesResponse.handleServicesResponse(
//       StatusCodes.StatusCodes.OK,
//       UserResponses.LIVE_EVENTS_FETCHED_SUCCESSFULLY,
//       events
//     );
//   }
// );

// const getNewEvents = errorUtilities.withServiceErrorHandling(async () => {
//   const projection = [
//     DatabaseConstants.DatabaseProjection.ID,
//     DatabaseConstants.DatabaseProjection.EVENT_TITLE,
//     DatabaseConstants.DatabaseProjection.EVENT_OWNER_NAME,
//     DatabaseConstants.DatabaseProjection.EVENT_COVER_IMAGE,
//     DatabaseConstants.DatabaseProjection.EVENT_IS_LIVE,
//   ];

//   const events = await eventRepositories.eventRepositories.getMany(
//     {},
//     projection,
//     {},
//     [
//       [
//         DatabaseConstants.DatabaseProjection.CREATED_AT,
//         DatabaseConstants.DatabaseCadre.DESC,
//       ],
//     ]
//   );
//   if (!events) {
//     throw errorUtilities.createError(
//       UserResponses.UNABLE_TO_FETCH_EVENTS,
//       StatusCodes.StatusCodes.NOT_FOUND
//     );
//   }
//   return handleServicesResponse.handleServicesResponse(
//     StatusCodes.StatusCodes.OK,
//     UserResponses.NEW_EVENTS_FETCHED_SUCCESSFULLY,
//     events
//   );
// });

// const getDiscoverEvents = errorUtilities.withServiceErrorHandling(
//   async (userId: string) => {
//     const user = (await userRepositories.userRepositories.getOne(
//       { id: userId },
//       [DatabaseConstants.DatabaseProjection.INTERESTS, DatabaseConstants.DatabaseProjection.ID]
//     )) as unknown as UserAttributes;

//     const events = await eventRepositories.eventRepositories.getMany({
//       category: { [Op.overlap]: user.interests },
//     });

//     if (!events) {
//       throw errorUtilities.createError(
//         UserResponses.UNABLE_TO_FETCH_EVENTS,
//         StatusCodes.StatusCodes.NOT_FOUND
//       );
//     }

//     return handleServicesResponse.handleServicesResponse(
//       StatusCodes.StatusCodes.OK,
//       UserResponses.EVENTS_FETCHED_SUCCESSFULLY,
//       events
//     );
//   }
// );

// const getRecordedEvents = errorUtilities.withServiceErrorHandling(async () => {
//   const projection = [
//     DatabaseConstants.DatabaseProjection.ID,
//     DatabaseConstants.DatabaseProjection.EVENT_TITLE,
//     DatabaseConstants.DatabaseProjection.EVENT_OWNER_NAME,
//     DatabaseConstants.DatabaseProjection.EVENT_COVER_IMAGE,
//     DatabaseConstants.DatabaseProjection.EVENT_IS_LIVE,
//   ];

//   const events = await eventRepositories.eventRepositories.getMany(
//     {
//       isRecorded: true,
//     },
//     projection
//   );

//   if (!events) {
//     throw errorUtilities.createError(
//       UserResponses.UNABLE_TO_FETCH_EVENTS,
//       StatusCodes.StatusCodes.NOT_FOUND
//     );
//   }

//   return handleServicesResponse.handleServicesResponse(
//     StatusCodes.StatusCodes.OK,
//     UserResponses.RECORDED_EVENTS_FETCHED_SUCCESSFULLY,
//     events
//   );
// });

// const getAllEvents = errorUtilities.withServiceErrorHandling(async () => {
//   const events = await eventRepositories.eventRepositories.getMany({});

//   if (!events) {
//     throw errorUtilities.createError(
//       UserResponses.UNABLE_TO_FETCH_EVENTS,
//       StatusCodes.StatusCodes.NOT_FOUND
//     );
//   }

//   return handleServicesResponse.handleServicesResponse(
//     StatusCodes.StatusCodes.OK,
//     UserResponses.EVENTS_FETCHED_SUCCESSFULLY,
//     events
//   );
// });

// const getTrendingEvents = errorUtilities.withServiceErrorHandling(async () => {
//   const projection = [
//     DatabaseConstants.DatabaseProjection.ID,
//     DatabaseConstants.DatabaseProjection.EVENT_TITLE,
//     DatabaseConstants.DatabaseProjection.EVENT_OWNER_NAME,
//     DatabaseConstants.DatabaseProjection.EVENT_COVER_IMAGE,
//     DatabaseConstants.DatabaseProjection.EVENT_IS_LIVE,
//   ];

//   const events = await eventRepositories.eventRepositories.getMany(
//     {},
//     projection,
//     {},
//     [
//       [
//         DatabaseConstants.DatabaseProjection.EVENT_NO_OF_LIKES,
//         DatabaseConstants.DatabaseCadre.DESC,
//       ],
//     ]
//   );

//   if (!events) {
//     throw errorUtilities.createError(
//       UserResponses.UNABLE_TO_FETCH_EVENTS,
//       StatusCodes.StatusCodes.NOT_FOUND
//     );
//   }

//   return handleServicesResponse.handleServicesResponse(
//     StatusCodes.StatusCodes.OK,
//     UserResponses.TRENDING_EVENTS_FETCHED_SUCCESSFULLY,
//     events
//   );
// });

export default {
  // userProfileUpdateService,
  // updateUserImageService,
  userSwitchesToHostService,
  // userfirstimeProfileUpdateService,
  // getAllLiveEventsService,
  // getNewEvents,
  // getDiscoverEvents,
  // getRecordedEvents,
  // getAllEvents,
  // confirmUserNameService,
  // getTrendingEvents,
};
