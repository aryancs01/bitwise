import Docker from "dockerode";

export interface CreateContainerOptions {
    imageName: string;
    cmdExec: string[];
    memoryLimit: number;
}

export async function createDockerContainer(options: CreateContainerOptions) {
    try {
        const docker = new Docker();

        const container = await docker.createContainer({
            Image: options.imageName,
            Cmd: options.cmdExec,
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: false,
            OpenStdin: true,
            HostConfig: {
                Memory: options.memoryLimit,
                PidsLimit: 100,
                CpuQuota: 50000, // Limit to 50% of CPU,
                CpuPeriod: 100000,
                SecurityOpt: ["no-new-privileges"], // Prevent privilege escalation
                NetworkMode: "none" // Disable networking for the container
            }
        });

        return container;
    }
    catch (error) {
        console.error("Error creating container:", error);
        return null;
    }
}