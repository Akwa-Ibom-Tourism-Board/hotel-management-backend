import { Request, Response } from "express";
import { userServices } from "../../services";
import { responseUtilities } from "../../utilities";
import { JwtPayload } from "jsonwebtoken";

// const updateUserProfile = async (
//   request: JwtPayload,
//   response: Response
// ): Promise<any> => {

//     const { id } = request.user

//   const newUser: any = await userServices.userProfileUpdateService(
//     { ...request.body, id }
//   );

//   return responseUtilities.responseHandler(
//     response,
//     newUser.message,
//     newUser.statusCode,
//     newUser.data
//   );
// };

// const firstTimeProfileUpdate = async (
//   request: JwtPayload,
//   response: Response
// ): Promise<any> => {

//     const { id } = request.user

//   const newUpdate: any = await userServices.userfirstimeProfileUpdateService(
//     { ...request.body, id }
//   );

//   if(newUpdate.statusCode === 200){
//     response
//       .header("x-access-token", newUpdate.data.accessToken)
//       .header("x-refresh-token", newUpdate.data.refreshToken);
//     }

//   return responseUtilities.responseHandler(
//     response,
//     newUpdate.message,
//     newUpdate.statusCode,
//     newUpdate.data
//   );
// };

const changeUserImage = async (
  request: JwtPayload,
  response: Response
): Promise<any> => {

  const { id } = request.user

  const imageUrl = request?.files?.['image'] ? request.files['image'][0].path : null;

  const newUserImage: any = await userServices.userSwitchesToHostService(imageUrl, id)

  return responseUtilities.responseHandler(
    response,
    newUserImage.message,
    newUserImage.statusCode,
    newUserImage.data
  );
};

// const confirmUserName = async (
//   request: JwtPayload,
//   response: Response
// ): Promise<any> => {
//   const { userName } = request.query;

//   const userNameConfirmation = await userServices.confirmUserNameService(userName)

//   return responseUtilities.responseHandler(
//     response,
//     userNameConfirmation.message,
//     userNameConfirmation.statusCode
//   );
// }

// const liveEvents = async (
//   request: JwtPayload,
//   response: Response
// ): Promise<any> => {

//   const liveEvents = await userServices.getAllLiveEventsService()

//   return responseUtilities.responseHandler(
//     response,
//     liveEvents.message,
//     liveEvents.statusCode,
//     liveEvents.data
//   );
// }

// const newEvents = async (
//   request: JwtPayload,
//   response: Response
// ): Promise<any> => {

//   const newEvents = await userServices.getNewEvents()

//   return responseUtilities.responseHandler(
//     response,
//     newEvents.message,
//     newEvents.statusCode,
//     newEvents.data
//   );
// }

// const eventsOfInterests = async (
//   request: JwtPayload,
//   response: Response
// ): Promise<any> => {

//   const interestEvents = await userServices.getDiscoverEvents()

//   return responseUtilities.responseHandler(
//     response,
//     interestEvents.message,
//     interestEvents.statusCode,
//     interestEvents.data
//   );
// }

// const recordedEvents = async (
//   request: JwtPayload,
//   response: Response
// ): Promise<any> => {

//   const recordedEvents = await userServices.getRecordedEvents()

//   return responseUtilities.responseHandler(
//     response,
//     recordedEvents.message,
//     recordedEvents.statusCode,
//     recordedEvents.data
//   );
// }

// const allEvents = async (
//   request: JwtPayload,
//   response: Response
// ): Promise<any> => {

//   const allEvents = await userServices.getAllEvents()

//   return responseUtilities.responseHandler(
//     response,
//     allEvents.message,
//     allEvents.statusCode,
//     allEvents.data
//   );
// }

// const trendingEvents = async (
//   request: JwtPayload,
//   response: Response
// ): Promise<any> => {

//   const trendingEvents = await userServices.getTrendingEvents()

//   return responseUtilities.responseHandler(
//     response,
//     trendingEvents.message,
//     trendingEvents.statusCode,
//     trendingEvents.data
//   );
// }



export default {
    // updateUserProfile,
    changeUserImage,
    // firstTimeProfileUpdate,
    // confirmUserName,
    // liveEvents,
    // newEvents,
    // eventsOfInterests,
    // recordedEvents,
    // allEvents,
    // trendingEvents
}