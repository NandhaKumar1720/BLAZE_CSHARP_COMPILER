const { parentPort, workerData } = require("worker_threads");
const { execSync } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

// Utility function to clean up temporary files
function cleanupFiles(...files) {
    files.forEach((file) => {
        try {
            fs.unlinkSync(file);
        } catch (err) {
            // Ignore errors (for files that may not exist)
        }
    });
}

// Worker logic
(async () => {
    const { code, input } = workerData;

    // Paths for the temporary C# file
    const tmpDir = os.tmpdir();
    const csFile = path.join(tmpDir, "Program.cs");
    const exeFile = path.join(tmpDir, "Program.dll");

    try {
        // Write the C# code to the Program.cs file
        fs.writeFileSync(csFile, code);

        // Compile the C# code
        try {
            execSync(`dotnet new console -o ${tmpDir} --force && mv ${csFile} ${tmpDir}/Program.cs && cd ${tmpDir} && dotnet build -c Release`, { encoding: "utf-8" });
        } catch (error) {
            cleanupFiles(csFile);
            return parentPort.postMessage({
                error: { fullError: `Compilation Error:\n${error.message}` },
            });
        }

        // Execute the compiled C# program
        let output = "";
        try {
            output = execSync(`dotnet ${exeFile}`, {
                input, // Pass input to the C# program
                encoding: "utf-8",
            });
        } catch (error) {
            cleanupFiles(csFile, exeFile);
            return parentPort.postMessage({
                error: { fullError: `Runtime Error:\n${error.message}` },
            });
        }

        // Clean up temporary files
        cleanupFiles(csFile, exeFile);

        // Send the output back to the main thread
        parentPort.postMessage({
            output: output || "No output received!",
        });
    } catch (err) {
        cleanupFiles(csFile, exeFile);
        return parentPort.postMessage({
            error: { fullError: `Server error: ${err.message}` },
        });
    }
})();
