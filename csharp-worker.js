const { parentPort, workerData } = require("worker_threads");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Paths
const projectDir = path.join(__dirname, "ConsoleApp");
const outputDir = path.join(projectDir, "bin/Release/net6.0");

// Worker logic
(async () => {
    const { code, input } = workerData;

    try {
        // Write the user's code to Program.cs
        const programFile = path.join(projectDir, "Program.cs");
        fs.writeFileSync(programFile, code);

        // Compile only Program.cs instead of rebuilding everything
        execSync(`dotnet build -c Release --no-incremental`, { cwd: projectDir, encoding: "utf-8" });

        // Run the compiled DLL directly (faster execution)
        const output = execSync(`dotnet ${outputDir}/ConsoleApp.dll`, {
            input,
            encoding: "utf-8",
            timeout: 5000, // Reduce timeout to 5 secs
        });

        parentPort.postMessage({
            output: output.trim() || "No output received!",
        });
    } catch (error) {
        parentPort.postMessage({
            error: { fullError: `Error:\n${error.message}` },
        });
    }
})();
