import { Queue, QueueEvents } from "bullmq";
import { env } from "../config/env";
import { SUBMISSION_QUEUE } from "../utils/constants";

export const submissionQueue = new Queue(SUBMISSION_QUEUE, {
  connection: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000, // 2 seconds
    },
  },
});

submissionQueue.on("error", (error) => {
  console.error("Submission Queue Error:", error);
});

submissionQueue.on("waiting", (job) => {
  console.log(`Job ${job.id} is waiting`);
});

// export const submissionEvent = new QueueEvents("submission");

// submissionEvent.on("completed", ({ jobId }) => {
//   console.log(`Job ${jobId} completed successfully`);
// });

// submissionEvent.on("failed", ({ jobId }, error) => {
//   console.error(`Job ${jobId} failed:`, error);
// });
