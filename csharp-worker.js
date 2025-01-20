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

    // Paths for temporary C# script
    const tmpDir = os.tmpdir();
    const sourceFile = path.join(tmpDir, `temp_${Date.now()}.cs`);
    const outputFile = path.join(tmpDir, `temp_${Date.now()}.exe`);

    try {
        // Write the C# code to the source file
        fs.writeFileSync(sourceFile, code);

        // Compile the C# code using `dotnet` CLI
        const compileCommand = `dotnet build -o ${tmpDir} ${sourceFile}`;
        execSync(compileCommand);

        // Execute the compiled program
        const runCommand = `dotnet script ${sourceFile}`;
        let output = execSync(runCommand, {
            input, // Pass input to the C# program
            encoding: "utf-8", // Ensures we get the output as a string
        });


        // Clean up temporary files after execution
        cleanupFiles(sourceFile, outputFile);

        // Send the output back to the main thread
        parentPort.postMessage({
            output: output || "No output received!",
        });
    } catch (err) {
        // Clean up files and send server error if anything goes wrong
        cleanupFiles(sourceFile, outputFile);
        return parentPort.postMessage({
            error: { fullError: `Server error: ${err.message}` },
        });
    }
})();
