const { parentPort, workerData } = require("worker_threads");
const { execSync } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

// Utility function to clean up temporary files
function cleanupFiles(directory) {
    try {
        fs.rmSync(directory, { recursive: true, force: true });
    } catch (err) {
        // Ignore errors during cleanup
    }
}

// Worker logic
(async () => {
    const { code, input } = workerData;

    // Create a temporary directory for the C# project
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "csharp-compiler-"));
    const projectDir = path.join(tmpDir, "ConsoleApp");

    try {
        // Create a new .NET console project
        execSync(`dotnet new console -o ${projectDir} --force`, { encoding: "utf-8" });

        // Write the user's C# code to Program.cs
        const programFile = path.join(projectDir, "Program.cs");
        fs.writeFileSync(programFile, code);

        // Build the project
        try {
            execSync(`dotnet build -c Release -o ${projectDir}/bin`, { cwd: projectDir, encoding: "utf-8" });
        } catch (error) {
            cleanupFiles(tmpDir);
            return parentPort.postMessage({
                error: { fullError: `Compilation Error:\n${error.message}` },
            });
        }

        // Run the compiled executable
        let output = "";
        try {
            output = execSync(`dotnet ${projectDir}/bin/ConsoleApp.dll`, {
                input,
                encoding: "utf-8",
            });
        } catch (error) {
            cleanupFiles(tmpDir);
            return parentPort.postMessage({
                error: { fullError: `Runtime Error:\n${error.message}` },
            });
        }

        // Clean up temporary files
        cleanupFiles(tmpDir);

        // Send the output back to the main thread
        parentPort.postMessage({
            output: output || "No output received!",
        });
    } catch (err) {
        cleanupFiles(tmpDir);
        return parentPort.postMessage({
            error: { fullError: `Server error: ${err.message}` },
        });
    }
})();
