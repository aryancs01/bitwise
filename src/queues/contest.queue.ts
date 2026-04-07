import { Queue } from "bullmq";
import { env } from "../config/env";
import { CONTEST_QUEUE } from "../utils/constants";

export const contestQueue = new Queue(CONTEST_QUEUE, {
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

contestQueue.on("error", (error) => {
  console.error("Contest Queue Error:", error);
});

contestQueue.on("waiting", (job) => {
  console.log(`Job ${job.id} is waiting`);
});

