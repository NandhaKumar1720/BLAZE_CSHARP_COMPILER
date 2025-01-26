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
                fs.unlinkSync(file);
            }
        } catch (err) {
            console.error(`Failed to clean up file: ${file}, error: ${err.message}`);
        }
    });
}

// Worker logic
(async () => {
    const { code, input } = workerData;

    // Define paths for temporary source file and output file
    const tmpDir = os.tmpdir();
    const uniqueId = Date.now();
    const sourceFile = path.join(tmpDir, `Program_${uniqueId}.cs`);
    const exeFile = path.join(tmpDir, `Program_${uniqueId}.exe`);

    try {
        // Write the C# source code to a temporary file
        fs.writeFileSync(sourceFile, code, { encoding: "utf-8" });

        // Compile the C# code using the `csc` compiler
        const compileCommand = `csc /out:${exeFile} ${sourceFile}`;
        execSync(compileCommand, { stdio: "inherit" });

        // Execute the compiled program and pass the input
        const runCommand = exeFile;
        const output = execSync(runCommand, {
            input,
            encoding: "utf-8",
        });

        // Send the output back to the main thread
        parentPort.postMessage({
            output: output || "No output received!",
        });
    } catch (err) {
        // Send the error back to the main thread
        parentPort.postMessage({
            error: { fullError: `Server error: ${err.message}` },
        });
    } finally {
        // Clean up temporary files
        cleanupFiles(sourceFile, exeFile);
    }
})();
