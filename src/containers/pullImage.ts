import Docker from "dockerode";
import { CPP_IMAGE, PYTHON_IMAGE } from "../utils/constants";

export async function pullImage(imageName: string): Promise<void> {
  const docker = new Docker();

  return new Promise((res, rej) => {
    docker.pull(imageName, (err: Error, stream:NodeJS.ReadableStream) => {
      if (err) {
        rej(err);
        return;
      }

      docker.modem.followProgress(stream, function onFinished(err, output: any){
        if (err) {
          rej(err);
          return;
        }
        res(output);
      }, function onProgress(event: any){
        console.log(event.status);
      });
    });
  })
}

export async function pullAllImages() {
  const images = [PYTHON_IMAGE, CPP_IMAGE];

  const promises = images.map(image => pullImage(image));

  try {
    await Promise.all(promises);
    console.log("All images pulled successfully");
  } catch (error) {
    console.error("Failed to pull one or more images", error);
  }
}