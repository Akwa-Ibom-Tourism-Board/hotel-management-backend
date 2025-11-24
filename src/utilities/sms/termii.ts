import { request, response } from "express";
import axios from "axios";
import { errorUtilities } from "../../utilities";

const sendTermiiSms = async (to: string, message: string) => {
  try {
    const messageStructure = {
      to: to,
      from: "AKSHTBoard",
      sms: message,
      type: "plain",
      api_key: process.env.TERMI_API_KEY,
      channel: "dnd",
    };
    const response = await axios.post(
      `${process.env.TERMI_BASE_URL}/api/sms/send`,
      messageStructure
    );
    console.log("SMS sent successfully via Termii:", response.data);
  } catch (error: any) {
    console.error("Error sending SMS via Termii:", error.response.data);
    throw errorUtilities.createError(
      "Failed to send SMS, Please try again later.",
      500
    );
  }
};

export default {
  sendTermiiSms,
};
