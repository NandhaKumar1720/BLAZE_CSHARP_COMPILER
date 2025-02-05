const { parentPort, workerData } = require("worker_threads");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Define filenames
const programFile = path.join(__dirname, "Program.cs");
const exeFile = path.join(__dirname, "Program.exe");

// Worker logic
(async () => {
    const { code, input } = workerData;

    try {
        // Write the user's C# code to Program.cs
        fs.writeFileSync(programFile, code);

        // Compile the C# code using Mono (mcs)
        execSync(`mcs -out:${exeFile} ${programFile}`, { encoding: "utf-8" });

        // Run the compiled executable with input
        const output = execSync(`mono ${exeFile}`, {
            input,
            encoding: "utf-8",
            timeout: 10000, // 10-second timeout
        });

        parentPort.postMessage({
            output: output || "No output received!",
        });
    } catch (error) {
        parentPort.postMessage({
            error: { fullError: `Error:\n${error.message}` },
        });
    }
})();
