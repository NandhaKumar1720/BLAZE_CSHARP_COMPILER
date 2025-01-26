const { parentPort, workerData } = require("worker_threads");
const { execSync } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

// Utility function to clean up temporary files
function cleanupFiles(...files) {
    files.forEach((file) => {
        try {
            if (fs.existsSync(file)) {
                if (fs.lstatSync(file).isDirectory()) {
                    fs.rmdirSync(file, { recursive: true });
                } else {
                    fs.unlinkSync(file);
                }
            }
        } catch (err) {
            console.error(`Failed to clean up file: ${file}, error: ${err.message}`);
        }
    });
}

// Worker logic
(async () => {
    const { code, input } = workerData;

    // Define paths for temporary C# files
    const tmpDir = os.tmpdir();
    const uniqueId = Date.now();
    const sourceFile = path.join(tmpDir, `main_${uniqueId}.cs`);
    const outputDir = path.join(tmpDir, `output_${uniqueId}`);
    const outputFile = path.join(outputDir, "main.dll");

    try {
        // Write the C# code to the source file
        fs.writeFileSync(sourceFile, code);

        // Compile the C# code using `dotnet` CLI
        fs.mkdirSync(outputDir); // Create the output directory
        const compileCommand = `dotnet build -o "${outputDir}" "${sourceFile}"`;
        execSync(compileCommand, { stdio: "inherit" });

        // Execute the compiled program
        const runCommand = `dotnet "${outputFile}"`;
        const output = execSync(runCommand, {
            input,
            encoding: "utf-8",
        });

        // Send the output back to the main thread
        parentPort.postMessage({
            output: output || "No output received!",
        });
    } catch (err) {
        parentPort.postMessage({
            error: { fullError: `Server error: ${err.message}` },
        });
    } finally {
        // Clean up temporary files and directories
        cleanupFiles(sourceFile, outputDir);
    }
})();
