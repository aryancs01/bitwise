import { log } from "node:console";
import { commands } from "./commands";
import { createDockerContainer } from "./createContainer";

export interface RunCodeOptions {
  code: string;
  language: "python" | "cpp";
  timeout: number; 
  imageName: string;
  input: string;
}

export async function runCode(options: RunCodeOptions) {
  const { code, language, timeout, imageName, input } = options;

  const container = await createDockerContainer({
    imageName: imageName,
    cmdExec: commands[language](code, input),
    memoryLimit: 1024 * 1024 * 1024 // 1GB
  });

  let isTimeLimitExceeded = false;

  const timeLimitExceededTimeout = setTimeout(() => {
    console.error("Time limit exceeded. Stopping container...");
    isTimeLimitExceeded = true;
    container?.kill();
  }, timeout);

  await container?.start();

  const status = await container?.wait();

  if(isTimeLimitExceeded) {
    await container?.remove();
    return {
      status: "time_limit_exceeded",
      output: "Time limit exceeded",
    }
  }

  const logs = await container?.logs({
    stdout: true,
    stderr: true,
  });
  
  const containerLogs = cleanLogs(logs); 

  await container?.remove();

  clearTimeout(timeLimitExceededTimeout);

  if (status.StatusCode === 0) {
    return {
      status: "success",
      output: containerLogs,
    }
  } else {
    return {
      status: "failed",
      output: containerLogs,
    }   
  }
}

function cleanLogs(logs: Buffer | string | undefined): string {
  if (!logs) return "";
  return logs.toString("utf-8")
    .replace(/\x00/g, '') // remove NULL bytes
    .replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, '') // remove control chars
    .trim();
}