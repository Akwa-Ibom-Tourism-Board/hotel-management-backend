const otpTemplates = {
  registrationOtp: (otp: string) =>
    `Welcome to Akwa Ibom State Hotels and Tourism Development Commission.
  Your OTP is: ${otp}.
  It expires in 10 minutes.
  Thank you.`,
};

export default otpTemplates;
