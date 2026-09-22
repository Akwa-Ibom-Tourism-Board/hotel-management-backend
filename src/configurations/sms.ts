import axios from "axios";
import configurations from ".";
import errorUtilities from "./error-handler";

// Dormant — the phone-OTP-for-establishment-registration flow this served has
// been retired (NIN + email OTP only, per the frontend rebuild). Kept working
// and available in case phone OTP is reintroduced later.

export const smsTemplates = {
  registrationOtp: (otp: string) =>
    `Welcome to Akwa Ibom State Hotels and Tourism Development Commission.
  Your OTP is: ${otp}.
  It expires in 10 minutes.
  Thank you.`,
};

export const sendTermiiSms = async (to: string, message: string) => {
  try {
    const response = await axios.post(
      `${configurations.TERMI_BASE_URL}/api/sms/send`,
      {
        to,
        from: "AKSHTBoard",
        sms: message,
        type: "plain",
        api_key: configurations.TERMI_API_KEY,
        channel: "dnd",
      },
    );
    return response.data;
  } catch (error: any) {
    console.error("Error sending SMS via Termii:", error?.response?.data ?? error.message);
    throw errorUtilities.createError(
      "Failed to send SMS, Please try again later.",
      500,
    );
  }
};

export default {
  sendTermiiSms,
  smsTemplates,
};
