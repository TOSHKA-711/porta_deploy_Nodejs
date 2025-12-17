import path from "path";
import { fileURLToPath } from "url";
import { execFile } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ProjectUploader = (folderPath, repoUrl, commitMessage) => {
  return new Promise((resolve, reject) => {
    const pythonPath = path.resolve(__dirname, "upload_git.py");

    console.log("Python script path:", pythonPath);
    console.log("Uploading folder:", folderPath);
    console.log(
      "Repo URL:",
      repoUrl.replace(/https:\/\/[^@]+@/, "https://***@")
    );

    execFile(
      "python3",
      [pythonPath, folderPath, repoUrl, commitMessage],
      { encoding: "utf8", maxBuffer: 1024 * 1024 * 10 },
      (err, stdout, stderr) => {
        console.log("==== STDOUT ====");
        console.log(stdout || "<empty>");
        console.log("==== STDERR ====");
        console.log(stderr || "<empty>");

        if (err) {
          console.error("Python script error:", {
            message: err.message,
            code: err.code,
            signal: err.signal,
            stdout,
            stderr,
          });

          // Extract meaningful error message
          let errorMessage = err.message || "Unknown error";
          if (stderr) {
            errorMessage = stderr.trim() || errorMessage;
          } else if (stdout && stdout.includes("Error:")) {
            errorMessage = stdout.trim();
          }

          return reject({
            message: errorMessage,
            code: err.code,
            signal: err.signal,
            stdout: stdout || "",
            stderr: stderr || "",
          });
        }

        // Check if stdout contains error indicators
        if (
          stdout &&
          (stdout.includes("Error:") || stdout.includes("fatal:"))
        ) {
          console.error("Git operation failed:", stdout);
          return reject({
            message: stdout.trim() || "Git operation failed",
            stdout,
            stderr,
          });
        }

        resolve(stdout);
      }
    );
  });
};
