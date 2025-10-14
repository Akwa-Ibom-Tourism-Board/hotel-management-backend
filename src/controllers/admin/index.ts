import { JwtPayload } from "jsonwebtoken";
import { adminService } from "../../services";
import { responseUtilities } from "../../utilities";
import { Request, Response } from "express";


const allDyteMeetings = async (
    request: JwtPayload,
    response: Response
  ): Promise<any> => {
  
    const allEvents: any = await adminService.getAllDyteMeetingsService()
  
    return responseUtilities.responseHandler(
      response,
      allEvents.message,
      allEvents.statusCode,
      allEvents.data
    );
  };


export default {
    allDyteMeetings
}