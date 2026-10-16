import nodemailer from "nodemailer";
import { SendMailClient } from "zeptomail";
import configurations from ".";

export interface EmailPayload {
  to: string;
  subject: string;
  htmlBody: string;
}

interface Transport {
  send: (payload: EmailPayload) => Promise<void>;
  warmUp?: () => Promise<void>;
}

const FROM_NAME = "Akwa Ibom State Hotels and Tourism Development Commission";

const buildSmtp = (): Transport => {
  const transport = nodemailer.createTransport({
    pool: true,
    host: configurations.ZEPTOMAIL_HOST || "smtp.zeptomail.com",
    port: 465,
    secure: true,
    auth: {
      user: "emailapikey",
      pass: configurations.ZEPTOMAIL_TOKEN!,
    },
  });

  return {
    send: async ({ to, subject, htmlBody }) => {
      await transport.sendMail({
        from: `${FROM_NAME} <${configurations.ZEPTO_EMAIL_FROM}>`,
        to,
        subject,
        html: htmlBody,
      });
    },
    warmUp: async () => {
      await transport.verify();
    },
  };
};

const DEFAULT_ZEPTOMAIL_API_URL = "https://cpaas.zoho.com/v1.1/email";

const buildApi = (): Transport => {
  const token = configurations.ZEPTOMAIL_API_TOKEN || configurations.ZEPTOMAIL_TOKEN;
  const from = configurations.ZEPTO_EMAIL_FROM;
  if (!token || !from) {
    throw new Error("ZeptoMail is not configured (ZEPTOMAIL_API_TOKEN / ZEPTO_EMAIL_FROM)");
  }

  const client = new SendMailClient({
    url: configurations.ZEPTOMAIL_API_URL || DEFAULT_ZEPTOMAIL_API_URL,
    token: token.startsWith("Zoho-enczapikey") ? token : `Zoho-enczapikey ${token}`,
  });

  return {
    send: async ({ to, subject, htmlBody }) => {
      try {
        await client.sendMail({
          from: { address: from, name: FROM_NAME },
          to: [{ email_address: { address: to, name: to } }],
          subject,
          htmlbody: htmlBody,
        });
      } catch (error: any) {
        const status = error.statusCode ? ` (${error.statusCode})` : "";
        const detail = error.data?.error?.message ?? error.data?.message ?? error.message;
        throw new Error(`ZeptoMail API request failed${status}: ${detail}`);
      }
    },
  };
};

let transport: Transport | undefined;
const getTransport = (): Transport => {
  if (!transport) {
    transport = process.env.NODE_ENV === "production" ? buildApi() : buildSmtp();
  }
  return transport;
};

export const warmUpEmailTransport = async (): Promise<void> => {
  await getTransport().warmUp?.();
};

export const sendEmail = async (payload: EmailPayload): Promise<void> => {
  await getTransport().send(payload);
};

export default sendEmail;
