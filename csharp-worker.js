const { parentPort, workerData } = require("worker_threads");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Pre-created project directory
const projectDir = path.join(__dirname, "ConsoleApp");
const outputDir = path.join(projectDir, "bin/Debug/net6.0");

// Worker logic
(async () => {
    const { code, input } = workerData;

    try {
        // Write the user's code to Program.cs
        const programFile = path.join(projectDir, "Program.cs");
        fs.writeFileSync(programFile, code);

        // Compile the project (Debug mode for faster build)
        execSync(`dotnet build -c Debug -o ${outputDir}`, { cwd: projectDir, encoding: "utf-8" });

        // Run the compiled DLL directly (faster than dotnet run)
        const output = execSync(`dotnet ${outputDir}/ConsoleApp.dll`, {
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
