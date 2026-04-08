import { Job, Worker } from "bullmq";
import { CONTEST_QUEUE } from "../utils/constants";
import { ContestParticipant, SubmissionStatus } from "../models/contest-participants.modals";
import { env } from "../config/env";
import { LANGUAGE_CONFIG } from "../config/language.config";
import { runCode } from "../containers/codeRunner";
import { createRedisSortedSet } from "../utils/redisUtils";

interface TestCase {
    id?: string;
    input: string;
    output: string;
}

interface ContestEvaluationJobData {
    contextParticipantId: string;
    problemId: string;
    code: string;
    language: "python" | "cpp";
    problem: {
        testcases: TestCase[];
    };
}

interface EvaluationResult {
    status: string;
    output: string;
}

function matchTestCaseWithResult(testCases: TestCase[], results: EvaluationResult[]) {
    const output: { status: string; testcaseId: string; output: string }[] = [];

    if (results.length !== testCases.length) {
        return;
    }

    testCases.forEach((testCase, index) => {
        if (results[index]?.status === "time_limit_exceeded") {
            output.push({
                status: "TLE",
                testcaseId: testCase.id || `${index}`,
                output: results[index].output,
            });
            return;
        }

        if (results[index]?.status === "failed") {
            output.push({
                status: "Error",
                testcaseId: testCase.id || `${index}`,
                output: results[index].output,
            });
            return;
        }

        if (results[index]?.status === "success") {
            output.push({
                status: testCase.output.trim() === results[index].output.trim() ? "AC" : "WA",
                testcaseId: testCase.id || `${index}`,
                output: results[index].output,
            });
        }
    });

    return output;
}

async function updateContestSubmission(
    contextParticipantId: string,
    problemId: string,
    status: SubmissionStatus,
) {
    const contextParticipant = await ContestParticipant.findById(contextParticipantId);

    if (!contextParticipant) {
        console.error(`Contest participant ${contextParticipantId} not found`);
        return false;
    }

    const submissionProblem = contextParticipant.submissions.find(
        (submission) => submission.problemId.toString() === problemId,
    );

    if (!submissionProblem) {
        console.error(`Problem ${problemId} not found in participant ${contextParticipantId}`);
        return false;
    }

    submissionProblem.status = status;

    await contextParticipant.save();

    if(status === SubmissionStatus.ACCEPTED || status === SubmissionStatus.WRONG_ANSWER) {
        const acceptedCount = contextParticipant.submissions.filter(
            (submission) => submission.status === SubmissionStatus.ACCEPTED,
        ).length;
        const totalProblems = contextParticipant.submissions.length;
        const elapsedTime = Date.now() - new Date(contextParticipant.createdAt).getTime();

        const leaderboardData = await createRedisSortedSet(
            contextParticipant.contestId.toString(),
            contextParticipant.userId.toString(),
            acceptedCount,
            elapsedTime,
        );

        console.log("Contest leaderboard update:", {
            contestId: contextParticipant.contestId.toString(),
            userId: contextParticipant.userId.toString(),
            acceptedCount,
            totalProblems,
            ...leaderboardData,
        });
    }
    
    return true;
}

async function setupContestWorker() {
    const worker = new Worker(
        CONTEST_QUEUE,
        async (job: Job) => {
            const data: ContestEvaluationJobData = job.data;

            await updateContestSubmission(
                data.contextParticipantId,
                data.problemId,
                SubmissionStatus.COMPILING,
            );

            try {
                const hasSubmission = await updateContestSubmission(
                    data.contextParticipantId,
                    data.problemId,
                    SubmissionStatus.RUNNING,
                );

                if (!hasSubmission) {
                    return;
                }

                const testCasesRunner = data.problem.testcases.map((testCase) => {
                    return runCode({
                        code: data.code,
                        language: data.language,
                        timeout: LANGUAGE_CONFIG[data.language].timeout,
                        imageName: LANGUAGE_CONFIG[data.language].imageName,
                        input: testCase.input,
                    });
                });

                const testCaseResults = await Promise.all(testCasesRunner);
                const output = matchTestCaseWithResult(data.problem.testcases, testCaseResults);

                if (!output) {
                    await updateContestSubmission(
                        data.contextParticipantId,
                        data.problemId,
                        SubmissionStatus.WRONG_ANSWER,
                    );
                    return;
                }

                const hasFailedCase = output.some(
                    (item) => item.status === "TLE" || item.status === "Error" || item.status === "WA",
                );

                await updateContestSubmission(
                    data.contextParticipantId,
                    data.problemId,
                    hasFailedCase ? SubmissionStatus.WRONG_ANSWER : SubmissionStatus.ACCEPTED,
                );
            } catch (err) {
                console.error("Error during contest code execution:", err);

                await updateContestSubmission(
                    data.contextParticipantId,
                    data.problemId,
                    SubmissionStatus.WRONG_ANSWER,
                );
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
        console.error(`Contest worker error: ${err}`);
    });

    worker.on("completed", (job) => {
        console.log(`Contest job ${job.id} completed successfully.`);
    });

    worker.on("failed", (job, err) => {
        console.error(`Contest job ${job?.id} failed with error: ${err}`);
    });

    return worker;
}

export async function startContestWorker() {
    await setupContestWorker();
}