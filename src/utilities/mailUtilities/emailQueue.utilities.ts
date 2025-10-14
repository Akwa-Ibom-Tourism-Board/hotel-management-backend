import Queue from "bull";
import { mailUtilities } from "..";

const emailQueue = new Queue("email queue", "redis://127.0.0.1:6379");

export const addEmailToQueue = async (emailData: {
  to: string;
  subject: string;
  body: string;
  actionLink?: string;
  actionText?: string;
}) => {
  return emailQueue.add("sendEmail", emailData, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  });
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
