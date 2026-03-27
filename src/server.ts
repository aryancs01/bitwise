import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { redisClient } from "./config/redis.config";
import { pullAllImages } from "./containers/pullImage";
import { runCode } from "./containers/codeRunner";
import { startWorker } from "./workers/evaluation.worker";
import { CPP_IMAGE } from "./utils/constants";

app.listen(env.PORT, async ()=>{
    await connectDB()
    await redisClient.ping();
    await startWorker();
    await pullAllImages();

    console.log(`Server running on port ${env.PORT}`);
})

// async function testPythonRunner() {
//   const code = `
// #include <iostream>
// using namespace std;

// int main() {
//     for(int i = 0; i < 5; i++) {
//         cout << i << endl;
//     }
//     return 0;
// }
//   `;  
//     await runCode({
//         code,
//         language: "cpp",
//         timeout: 10000,
//         imageName: CPP_IMAGE,
//         input: "0\n1\n2\n3\n4"
//     });    
// }