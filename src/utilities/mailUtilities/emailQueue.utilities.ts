import Queue from "bull";
import { mailUtilities } from "..";
import config from "../../configurations/config";

const emailQueue = new Queue("email queue", config?.REDIS_URL!);

export const addEmailToQueue = async (emailData: {
  to: string;
  subject: string;
  body: string;
  actionLink?: string;
  actionText?: string;
}) => {
  emailQueue.add("sendEmail", emailData, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  }).catch(error => {
    console.error("Failed to add email to queue:", error);
  });
  return;
};

emailQueue.process("sendEmail", async (job) => {
  const { to, subject, body, actionLink, actionText } = job.data;
  await mailUtilities.sendMail(to, body, subject, actionLink, actionText);
});

emailQueue.on("completed", (job) => {
  console.log(`Email job ${job.id} completed`);
});

emailQueue.on("failed", (job, err) => {
  console.error(`Email job ${job?.id} failed: ${err.message}`);
});

export default {
    addEmailToQueue,
}
