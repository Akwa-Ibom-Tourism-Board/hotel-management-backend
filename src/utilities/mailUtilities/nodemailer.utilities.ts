import nodemailer from "nodemailer";
import {
  getEmailTemplate,
  emailTemplates,
} from "../emailTemplates/emailTemplates.utilities";
import dotenv from "dotenv";
import { Resend } from 'resend';
import config from "../../configurations/config";

dotenv.config();

const resend = new Resend(config.RESEND_API_KEY);

// const transport = nodemailer.createTransport({
//   service: "smtp.gmail.com",
//   // host: "smtp.office365.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_PASSWORD,
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });

const sendMail = async (
  to: string,
  message: string,
  subject: string,
  actionLink?: string,
  actionText?: string
) => {
  try {
// const mailOptions = {
    //   from: `Akwa Ibom State Hotels and Tourism Board <noreply@akwaibomtourism.com>`,
    //   to,
    //   subject,
    //   html: getEmailTemplate(message, actionLink, actionText),
    // };

    // const response = await transport.sendMail(mailOptions);
      const { data, error } = await resend.emails.send({
      from: `Akwa Ibom State Hotels and Tourism Board <onboarding@resend.dev>`,
      to: [to],
      subject,
      html: getEmailTemplate(message, actionLink, actionText),
    });

    if (error) {
      console.error('Resend email error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Email sent successfully via Resend:', {
      to,
      subject,
      emailId: data?.id,
      status: data,
    });
    
    return data;
  } catch (err: any) {
    console.error("Error sending email:", err.message);
    throw new Error(err.message);
  }
};

// const sendTemplateMail = async (
//   to: string,
//   templateType: "welcome" | "registrationComplete" | "passwordReset",
//   templateData: {
//     userName?: string;
//     businessName?: string;
//     verificationLink?: string;
//     resetLink?: string;
//   },
//   subject?: string
// ) => {
//   try {
//     let html: string;
//     let finalSubject: string;

//     switch (templateType) {
//       case "welcome":
//         html = emailTemplates.welcome(
//           templateData.userName!,
//           templateData.verificationLink
//         );
//         finalSubject =
//           subject ||
//           "Welcome to Akwa Ibom State Hotel and Tourism Board Portal";
//         break;
//       case "registrationComplete":
//         html = emailTemplates.registrationComplete(templateData.businessName!);
//         finalSubject =
//           subject || "Registration Received - Akwa Ibom Tourism Board";
//         break;
//       case "passwordReset":
//         html = emailTemplates.passwordReset(templateData.resetLink!);
//         finalSubject = subject || "Password Reset Request";
//         break;
//       default:
//         throw new Error("Invalid template type");
//     }

//     const mailOptions = {
//       from: `Akwa Ibom State Hotels and Tourism Board <noreply@akwaibomtourism.com>`,
//       to,
//       subject: finalSubject,
//       html,
//     };

//     const response = await transport.sendMail(mailOptions);
//     return response;
//   } catch (err: any) {
//     console.error("Error sending template email:", err.message);
//     throw new Error(err.message);
//   }
// };

export default {
  sendMail,
  // sendTemplateMail,
};
