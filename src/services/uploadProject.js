import path from "path";
import { fileURLToPath } from "url";
import { execFile } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ProjectUploader = (folderPath, repoUrl, commitMessage) => {
  return new Promise((resolve, reject) => {
    const pythonPath = path.resolve(__dirname, "upload_git.py");

    console.log("Python script path:", pythonPath);

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
          console.error("Python script error:", err.message || err);
          return reject({
            message: err.message || "Unknown error",
            code: err.code,
            stdout,
            stderr,
          });
        }

        resolve(stdout);
      }
    );
  });
};
