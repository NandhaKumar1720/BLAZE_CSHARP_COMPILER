const { parentPort, workerData } = require("worker_threads");
const { execSync } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

// Utility function to clean up temporary files and directories
function cleanupFiles(...files) {
    files.forEach((file) => {
        try {
            if (fs.existsSync(file)) {
                if (fs.lstatSync(file).isDirectory()) {
                    fs.rmSync(file, { recursive: true, force: true });
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

    // Define paths for temporary project
    const tmpDir = os.tmpdir();
    const uniqueId = Date.now();
    const projectDir = path.join(tmpDir, `project_${uniqueId}`);
    const sourceFile = path.join(projectDir, "Program.cs");
    const projectFile = path.join(projectDir, "project.csproj");

    try {
        // Create project directory
        fs.mkdirSync(projectDir);

        // Write the C# source code to the Program.cs file
        fs.writeFileSync(
            sourceFile,
            code,
            { encoding: "utf-8" }
        );

        // Write a minimal project file
        const projectContent = `
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net6.0</TargetFramework>
  </PropertyGroup>
</Project>
        `;
        fs.writeFileSync(projectFile, projectContent, { encoding: "utf-8" });

        // Build the project using `dotnet`
        const buildCommand = `dotnet build "${projectDir}" -o "${projectDir}/bin"`;
        execSync(buildCommand, { stdio: "inherit" });

        // Execute the compiled program
        const runCommand = `dotnet "${projectDir}/bin/project.dll"`;
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
        // Clean up temporary files and directories
        cleanupFiles(projectDir);
    }
})();
