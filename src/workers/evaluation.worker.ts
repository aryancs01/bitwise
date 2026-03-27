import { Job, Worker } from "bullmq";
import { SUBMISSION_QUEUE } from "../utils/constants";
import { env } from "../config/env";
import { runCode } from "../containers/codeRunner";
import { LANGUAGE_CONFIG } from "../config/language.config";
import { Problem } from "../models/problem.model";

export interface TestCase {
  input: string;
  output: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  editorial: string;
  testcases: TestCase[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EvaluationJobData {
  code: string;
  submissionId: string;
  language: "python" | "cpp";
  problem: Problem;
}

// "success" | "failed" | "time_limit_exceeded"
export interface EvaluationResult {
  status: string;
  output: string;
}

function matchTestCaseWithResult(
  testCases: TestCase[],
  results: EvaluationResult[],
) {
  const output: string[] = [];
  if (results.length !== testCases.length) {
    console.log("WA");
    return;
  }
  testCases.map((testCase, index) => {
    if (results[index]?.status === "time_limit_exceeded") {
      output.push("TLE");
    } else if (results[index]?.status === "failed") {
      output.push("Error");
    } else if (results[index]?.status === "success") {
      if (testCase.output.trim() === results[index].output.trim()) {
        output.push("AC");
      } else {
        output.push("WA");
      }
    } 
  });
  return output;
}

async function setupEvaluationWorker() {
  const worker = new Worker(
    SUBMISSION_QUEUE,
    async (job: Job) => {
      console.log(`Processing job ${job.id}`);
      const data: EvaluationJobData = job.data;

      const firstTestCase = data.problem.testcases[1];

      if (!firstTestCase) {
        throw new Error("No test cases found");
      }

      try {
        const testCasesRunner = data.problem.testcases.map((testCase) => {
          return runCode({
            code: data.code,
            language: data.language,
            timeout: LANGUAGE_CONFIG[data.language].timeout,
            imageName: LANGUAGE_CONFIG[data.language].imageName,
            input: testCase.input,
          });
        });

        const testCasesRunnerPromise = await Promise.all(testCasesRunner);

        console.log("Test case results:", testCasesRunnerPromise);

        const output = matchTestCaseWithResult(data.problem.testcases, testCasesRunnerPromise);

        console.log("Final output:", output);
      } catch (err) {
        console.error("Error during code execution:", err);
      }
    },
    {
      connection: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
      },
    },
  );

  worker.on("error", (err) => {
    console.error(`Worker error: ${err}`);
  });

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed successfully.`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed with error: ${err}`);
  });
}

export async function startWorker() {
  await setupEvaluationWorker();
}
