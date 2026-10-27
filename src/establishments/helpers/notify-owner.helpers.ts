import { User } from "../../auth/User";
import { queueEmail } from "../../configurations/email-queue";
import { fillSectionsPromptTemplate } from "../../auth/emailTemplates/fillSectionsPrompt";

/**
 * Queues the "please log in and fill out your Sections" email for an
 * establishment that just became newly associated with an owner — self
 * registration, self claim, draft submission, or an admin linking an
 * existing account to a hotel. Never throws: a failed lookup/queue here
 * should never fail the request that triggered it.
 */
export const notifyOwnerToFillSections = async (ownerId: string, businessName: string): Promise<void> => {
  try {
    const owner = await User.findByPk(ownerId);
    if (!owner) return;

    const template = fillSectionsPromptTemplate(
      (owner.get("firstName") as string | null) ?? "there",
      businessName || "your establishment",
    );
    await queueEmail({ to: owner.get("email") as string, subject: template.subject, htmlBody: template.htmlBody });
  } catch (error) {
    console.error("Failed to queue fill-sections email:", error);
  }
};
