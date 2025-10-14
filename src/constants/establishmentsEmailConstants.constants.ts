export enum MailSubjects {
  OTP = "Your OTP Code",
  REGISTRATION_SUCCESS = "Hospitality Establishment Registration Successful",
  OTP_VERIFIED = "OTP Verification Successful",
  ACCOUNT_CREATED = "Account Created Successfully",
  LOGIN_ACTIVITY = "Login Activity Detected",
}

const generateMessages = () => {
  return {
    OTP: (otp: string) => {
      return `Your verification code is ${otp}. It expires in 5 minutes. Please do not share this code with anyone.`;
    },

    REGISTRATION_SUCCESS: (
      establishmentName: string,
      establishmentCode: string
    ) => {
      return `
        <p>Dear ${establishmentName},</p>
        <p>Your hospitality establishment has been successfully registered with the Akwa Ibom State Hotels and Tourism Board.</p>
        <p><strong>Establishment Code:</strong> ${establishmentCode}</p>
        <p>Please keep this code safe as it will be used for all future communications and updates regarding your establishment.</p>
        <p>Thank you for complying with the hospitality registration process.</p>
      `;
    },

    OTP_VERIFIED: () => {
      return `
        <p>Your OTP has been successfully verified.</p>
        <p>You can now proceed to complete your registration or access your dashboard.</p>
      `;
    },

    ACCOUNT_CREATED: (establishmentName: string) => {
      return `
        <p>Dear ${establishmentName},</p>
        <p>Your account has been successfully created on the Akwa Ibom State Hospitality Management Portal.</p>
        <p>You can now log in, update your profile, and manage your establishment information.</p>
        <p>Welcome onboard!</p>
      `;
    },

    LOGIN_ACTIVITY: (name: string, date: string, time: string) => {
      return `
        <p>Hello ${name},</p>
        <p>There was a login to your account on <strong>${date}</strong> at <strong>${time}</strong>.</p>
        <p>If you did not initiate this login, please contact support immediately.</p>
      `;
    },
  };
};

export default {
  MailSubjects,
  generateMessages,
};
