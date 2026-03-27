import { IProblem } from "../models/problem.model";
import { SubmissionLanguage } from "../models/submission.model";
import { submissionQueue } from "../queues/submission.queue";
import { SUBMISSION_QUEUE } from "../utils/constants";


export interface ISubmissionJob {
    submissionId: string;
    problem: IProblem;
    code: string;
    language: SubmissionLanguage;
    userId: string;
}

export async function addSubmissionJob(data: ISubmissionJob): Promise<string | null> {
    try {
        const job = await submissionQueue.add(SUBMISSION_QUEUE, data);

        console.log(`Added submission job with ID: ${job.id} for submission ID: ${data.submissionId}`);

        return job.id || null;
    }catch (error) {
        console.error(`Error adding submission job: ${(error as Error).message}`);
        return null
    }
}