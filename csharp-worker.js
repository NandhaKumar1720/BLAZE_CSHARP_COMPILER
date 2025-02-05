const { parentPort, workerData } = require("worker_threads");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Paths
const projectDir = path.join(__dirname, "ConsoleApp");
const programFile = path.join(projectDir, "Program.cs");
const outputDir = path.join(projectDir, "bin/Release/net6.0");

// Worker logic
(async () => {
    const { code, input } = workerData;

    try {
        // Write the user's code to Program.cs
        fs.writeFileSync(programFile, code);

        // Compile *ONLY* Program.cs (skip full build)
        execSync(`dotnet build -c Release --no-dependencies --nologo`, { cwd: projectDir, encoding: "utf-8" });

        // Run the compiled DLL directly
        const output = execSync(`dotnet ${outputDir}/ConsoleApp.dll`, {
            input,
            encoding: "utf-8",
            timeout: 5000, // Max execution time
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
