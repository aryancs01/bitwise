import { IProblem } from "../models/problem.model";
import { SubmissionLanguage } from "../models/submission.model";
import { contestQueue } from "../queues/contest.queue";
import { CONTEST_QUEUE } from "../utils/constants";


export interface IContestJob {
    contextParticipantId: string;
    problemId: string;
    problem: IProblem;
    code: string;
    language: SubmissionLanguage;
    userId: string;
}

export async function addContestJob(data: IContestJob): Promise<string | null> {
    try {
        const job = await contestQueue.add(CONTEST_QUEUE, data);

        console.log(`Added contest participant job with ID: ${job.id} for context participant ID: ${data.contextParticipantId}`);

        return job.id || null;
    }catch (error) {
        console.error(`Error adding contest participant job: ${(error as Error).message}`);
        return null
    }
}