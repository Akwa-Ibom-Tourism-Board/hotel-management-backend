export const getEmailTemplate = (
  message: string,
  actionLink?: string,
  actionText?: string
) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Akwa Ibom State Hotels and Tourism Board</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #fdf8f4;
      font-family: Arial, sans-serif;
      color: #2a2523;
    "
  >
    <table
      cellpadding="0"
      cellspacing="0"
      border="0"
      width="100%"
      style="background-color: #fdf8f4; padding: 20px 0"
    >
      <tr>
        <td align="center">
          <table
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="600"
            style="
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
            "
          >
            <!-- Header -->
            <tr>
              <td
                align="center"
                bgcolor="#00563b"
                style="padding: 30px; color: #ffffff"
              >
                <h1 style="margin: 0; font-size: 20px">
                  <span
                    style="
                      padding: 10px;
                      margin-right: 10px;
                      border-radius: 20px;
                      background-color: #4a9e5c;
                    "
                    >🏢</span
                  >
                  Akwa Ibom State Hotel and Tourism Board
                </h1>
              </td>
            </tr>

            <!-- Welcome Section -->
            <tr>
              <td align="center" style="padding: 40px 30px 10px 30px">
                <h2
                  style="font-size: 24px; font-weight: bold; margin: 0 0 16px 0"
                >
                  Welcome to the Akwa Ibom State Hotel and Tourism Board!
                </h2>
              </td>
            </tr>

            <!-- Message Section -->
            <tr>
              <td style="padding: 0 30px 30px 30px">
                <p
                  style="
                    font-size: 16px;
                    color: #78716e;
                    line-height: 1.6;
                    margin: 0 0 20px 0;
                  "
                >
                  ${message}
                </p>
              </td>
            </tr>

            <!-- Action Button -->
            ${
              actionLink
                ? `
            <tr>
              <td align="center" style="padding: 0 30px 30px 30px">
                <a
                  href="${actionLink}"
                  target="_blank"
                  style="
                    display: inline-block;
                    background-color: #e77818;
                    color: #ffffff;
                    text-decoration: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    font-size: 16px;
                    font-weight: bold;
                  "
                >
                  ${actionText}
                </a>
              </td>
            </tr>
            `
                : ""
            }

            <!-- Regards -->
            <tr>
              <td
                align="center"
                style="
                  padding: 20px 30px 40px 30px;
                  border-top: 1px solid #f2f0ed;
                "
              >
                <p style="font-size: 16px; color: #78716e; margin: 0">
                  Best regards,
                </p>
                <p
                  style="
                    font-size: 18px;
                    font-weight: bold;
                    color: #e77818;
                    margin: 8px 0 0 0;
                  "
                >
                  The Akwa Ibom State Hotel and Tourism Board Team
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                align="center"
                bgcolor="#00563b"
                style="padding: 30px; color: #ffffff"
              >
                <h3 style="color: #ffffff; margin: 0 0 16px 0; font-size: 18px">
                  Contact Information
                </h3>

                <table
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  width="100%"
                  style="max-width: 500px; margin: 0 auto"
                >
                  <tr>
                    <td
                      style="
                        padding: 8px 0;
                        text-align: center;
                        font-size: 14px;
                      "
                    >
                      📍 <a
                        href="https://www.google.com/maps/search/?api=1&query=Plot+57,+H-Line,+Ewet+Housing,+Uyo,+Akwa+Ibom+State,+Nigeria"
                        target="_blank"
                        style="text-decoration: none"
                      >
                        Plot 57, H-Line, Ewet Housing, Uyo, Akwa Ibom State,
                        Nigeria
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style="
                        padding: 8px 0;
                        text-align: center;
                        font-size: 14px;
                      "
                    >
                      📞  <a href="tel:+2341234567890" style="text-decoration: none;">
    +234 123 456 7890
  </a>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style="
                        padding: 8px 0;
                        text-align: center;
                        font-size: 14px;
                      "
                    >
                      ✉️
                       <a href="mailto:info@akwaibomtourism.com" style="text-decoration: none;">
    info@akwaibomtourism.com
  </a>
                    </td>
                  </tr>
                </table>

                <!-- Social Links -->
                <table
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  width="100%"
                  style="margin-top: 20px"
                >
                  <tr>
                    <td align="center">
                      <a
                        href="#"
                        style="
                          margin: 0 10px;
                          color: #ffffff;
                          text-decoration: none;
                          font-size: 14px;
                        "
                        >Facebook</a
                      >
                      <a
                        href="#"
                        style="
                          margin: 0 10px;
                          color: #ffffff;
                          text-decoration: none;
                          font-size: 14px;
                        "
                        >Twitter</a
                      >
                      <a
                        href="#"
                        style="
                          margin: 0 10px;
                          color: #ffffff;
                          text-decoration: none;
                          font-size: 14px;
                        "
                        >Instagram</a
                      >
                      <a
                        href="#"
                        style="
                          margin: 0 10px;
                          color: #ffffff;
                          text-decoration: none;
                          font-size: 14px;
                        "
                        >LinkedIn</a
                      >
                    </td>
                  </tr>
                </table>

                <p style="font-size: 12px; opacity: 0.7; margin-top: 20px; color: #ffffff;">
                  &copy; ${new Date().getFullYear()} Akwa Ibom State Hotel and
                  Tourism Board. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

export const emailTemplates = {
  welcome: (userName: string, verificationLink?: string) =>
    getEmailTemplate(
      `Dear ${userName},<br><br>
       Welcome to the Akwa Ibom State Hotel and Tourism Board Portal! We're excited to have you join our community of hospitality professionals.<br><br>
       As part of our mandate to register and regulate all hospitality establishments in Akwa Ibom State, we're committed to supporting your business growth and compliance.`,
      verificationLink,
      "Verify Your Account"
    ),

  registrationComplete: (businessName: string) =>
    getEmailTemplate(
      `Dear Proprietor,<br><br>
       We're pleased to inform you that your registration for <strong>${businessName}</strong> has been successfully completed and received by the Akwa Ibom State Hotel and Tourism Board.<br><br>
       Your application is now under review. You will be notified once the review process is complete.`,
      undefined,
      undefined
    ),

  passwordReset: (resetLink: string) =>
    getEmailTemplate(
      `We received a request to reset your password for the Akwa Ibom State Hotel and Tourism Board Portal.<br><br>
       Click the button below to create a new password. This link will expire in 1 hour for security reasons.`,
      resetLink,
      "Reset Password"
    ),
};
