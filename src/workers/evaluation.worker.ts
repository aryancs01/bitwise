import { Job, Worker } from "bullmq";
import { SUBMISSION_QUEUE } from "../utils/constants";
import { env } from "../config/env";
import { runCode } from "../containers/codeRunner";
import { LANGUAGE_CONFIG } from "../config/language.config";
import { Problem } from "../models/problem.model";
import { Submission } from "../models/submission.model";

export interface TestCase {
  id: string;
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
  const output: { status: string; testcaseId: string; output: string }[] = [];
  if (results.length !== testCases.length) {
    console.log("WA");
    return;
  }
  testCases.map((testCase, index) => {
    if (results[index]?.status === "time_limit_exceeded") {
      output.push({
        status: "TLE",
        testcaseId: testCase.id,
        output: results[index].output
      });
    } else if (results[index]?.status === "failed") {
      output.push({
        status: "Error",
        testcaseId: testCase.id,
        output: results[index].output
      });
    } else if (results[index]?.status === "success") {
      if (testCase.output.trim() === results[index].output.trim()) {
        output.push({
          status: "AC",
          testcaseId: testCase.id,
          output: results[index].output
        });
      } else {
        output.push({
          status: "WA",
          testcaseId: testCase.id,
          output: results[index].output
        });
      }
    } 
  });
  return output;
}

async function setupEvaluationWorker() {
  const worker = new Worker(
    SUBMISSION_QUEUE,
    async (job: Job) => {
      await Submission.findByIdAndUpdate(job.data.submissionId, { status: "compiling" });
      const data: EvaluationJobData = job.data;

      const firstTestCase = data.problem.testcases[1];

      if (!firstTestCase) {
        throw new Error("No test cases found");
      }

      try {
        await Submission.findByIdAndUpdate(data.submissionId, { status: "running" });
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

        if(!output) {
          console.log("Error in matching test cases with results");
          return;
        }

        if (output.some((o) => o.status === "TLE") || output.some((o) => o.status === "Error") || output.some((o) => o.status === "WA")) {
          await Submission.findByIdAndUpdate(data.submissionId, { status: "wrong_answer" });
        } else {
          await Submission.findByIdAndUpdate(data.submissionId, { status: "accepted" });
          console.log("All test cases passed successfully");
        }

        await Submission.findByIdAndUpdate(data.submissionId, {
          submission: output
        })

      } catch (err) {
        console.error("Error during code execution:", err);
        await Submission.findByIdAndUpdate(data.submissionId, { status: "wrong_answer" });
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
