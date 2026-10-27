import { wrapEmailHtml } from "../../configurations/email";
import configurations from "../../configurations";

/** Sent whenever an establishment becomes newly associated with an owner's
 * account — self-registration, self-claim, draft submission, or an admin
 * linking an existing account to a hotel — so the owner always gets a
 * direct prompt (and a link they can come back to) to go fill in its
 * Sections data. */
export const fillSectionsPromptTemplate = (name: string, businessName: string) => ({
  subject: `Finish setting up ${businessName} on the Commission Portal`,
  htmlBody: wrapEmailHtml(
    `Hello ${name},<br><br>
     <strong>${businessName}</strong> is now linked to your account on the Akwa Ibom State Hotels and Tourism Development Commission Portal.<br><br>
     Please log in to review its details and fill out its Accommodation, Employment, Wage, Guest Arrival, Occupancy and Room Rate sections — the Commission uses this information to track activity across the state.`,
    `${configurations.FRONTEND_URL}/login`,
    "Log In",
  ),
});
