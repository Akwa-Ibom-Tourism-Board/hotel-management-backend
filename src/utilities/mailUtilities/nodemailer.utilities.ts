import nodemailer from "nodemailer";
import {
  getEmailTemplate,
  emailTemplates,
} from "../emailTemplates/emailTemplates.utilities";
import dotenv from "dotenv";

dotenv.config();

const transport = nodemailer.createTransport({
  service: "gmail",
  // host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendMail = async (
  to: string,
  message: string,
  subject: string,
  actionLink?: string,
  actionText?: string
) => {
  try {
    const mailOptions = {
      from: `Akwa Ibom State Hotels and Tourism Board <noreply@akwaibomtourism.com>`,
      to,
      subject,
      html: getEmailTemplate(message, actionLink, actionText),
    };

    const response = await transport.sendMail(mailOptions);
    return response;
  } catch (err: any) {
    console.error("Error sending email:", err.message);
    throw new Error(err.message);
  }
};

const sendTemplateMail = async (
  to: string,
  templateType: "welcome" | "registrationComplete" | "passwordReset",
  templateData: {
    userName?: string;
    businessName?: string;
    verificationLink?: string;
    resetLink?: string;
  },
  subject?: string
) => {
  try {
    let html: string;
    let finalSubject: string;

    switch (templateType) {
      case "welcome":
        html = emailTemplates.welcome(
          templateData.userName!,
          templateData.verificationLink
        );
        finalSubject =
          subject ||
          "Welcome to Akwa Ibom State Hotel and Tourism Board Portal";
        break;
      case "registrationComplete":
        html = emailTemplates.registrationComplete(templateData.businessName!);
        finalSubject =
          subject || "Registration Received - Akwa Ibom Tourism Board";
        break;
      case "passwordReset":
        html = emailTemplates.passwordReset(templateData.resetLink!);
        finalSubject = subject || "Password Reset Request";
        break;
      default:
        throw new Error("Invalid template type");
    }

    const mailOptions = {
      from: `Akwa Ibom State Hotels and Tourism Board <noreply@akwaibomtourism.com>`,
      to,
      subject: finalSubject,
      html,
    };

    const response = await transport.sendMail(mailOptions);
    return response;
  } catch (err: any) {
    console.error("Error sending template email:", err.message);
    throw new Error(err.message);
  }
};

export default {
  sendMail,
  sendTemplateMail,
};
