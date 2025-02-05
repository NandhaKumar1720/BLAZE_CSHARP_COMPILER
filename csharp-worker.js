const { parentPort, workerData } = require("worker_threads");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Pre-created project directory
const projectDir = path.join(__dirname, "ConsoleApp");

// Worker logic
(async () => {
    const { code, input } = workerData;

    try {
        // Write the user's code to Program.cs
        const programFile = path.join(projectDir, "Program.cs");
        fs.writeFileSync(programFile, code);

        // Compile and Run using dotnet run (Debug mode for faster build)
        let output = "";
        try {
            output = execSync(`dotnet run --no-restore --no-build -c Debug`, {
                cwd: projectDir,
                input,
                encoding: "utf-8",
                timeout: 10000, // 10-second timeout
            });
        } catch (error) {
            return parentPort.postMessage({
                error: { fullError: `Runtime Error:\n${error.message}` },
            });
        }

        // Send output back to the main thread
        parentPort.postMessage({
            output: output || "No output received!",
        });
    } catch (err) {
        return parentPort.postMessage({
            error: { fullError: `Server error: ${err.message}` },
        });
    }
})();
