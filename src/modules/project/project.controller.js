import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import * as unzipper from "unzipper";
import { userModel } from "../../../DB/models/userModel.js";
import { projectModel } from "../../../DB/models/projectModel.js";
import cloudinary from "../../utils/multerConfig.js";
import { ProjectUploader } from "../../services/uploadProject.js";
import { createGitHubRepo } from "../../services/createGithubRepo.js";

//------------------------------ publishing ------------------------
// get Github repos
export const getGithubRepos = async (req, res, next) => {
  const { userData } = req;
  if (!userData) {
    return next(new Error("User data not found in request"));
  }
  const userCheck = await userModel.findById(userData._id);
  if (!userCheck) {
    return next(new Error("User not found"));
  }
  const token = userCheck.githubToken;
  const response = await fetch(
    "https://api.github.com/user/repos?per_page=1000",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();
  res.json(data);
};

// upload to github

export const uploadProject = async (req, res, next) => {
  let tempFolderPath = null; // ✅ لازم يكون هنا
  let zipFilePath = null;
  const uploadsDir = path.resolve("uploads"); // مسار مجلد uploads

  try {
    const { folderPath: bodyFolderPath, repoName } = req.body;
    const { userData } = req;
    const commitMessage = "Upload via PortaDeploy";

    if (!userData)
      return next(new Error("User data not found", { cause: 404 }));

    if (!repoName)
      return res.status(400).json({ error: "repoName is required" });

    if (!req.file && !bodyFolderPath)
      return res
        .status(400)
        .json({ error: "projectZip file or folderPath is required" });

    const userCheck = await userModel.findById(userData.id);
    if (!userCheck) return next(new Error("User not exist", { cause: 404 }));

    const GITHUB_TOKEN = userCheck.githubToken;
    if (!GITHUB_TOKEN)
      return next(new Error("Github token not found", { cause: 400 }));

    // ✅ 1) Create GitHub repo
    const repo = await createGitHubRepo(repoName, GITHUB_TOKEN);
    if (!repo.success)
      return next(new Error("Failed to create GitHub repo", { cause: 500 }));

    // ✅ 2) Build authenticated repo URL
    const repoUrl = repo.cloneUrl.replace(
      "https://",
      `https://${GITHUB_TOKEN}@`
    );

    let finalFolderPath = bodyFolderPath;

    // ✅ 3) If a zip file was uploaded, extract it
    if (req.file) {
      zipFilePath = req.file.path;

      const tempBase = path.resolve("temp");
      if (!fs.existsSync(tempBase)) fs.mkdirSync(tempBase, { recursive: true });

      tempFolderPath = path.join(
        tempBase,
        `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      );
      fs.mkdirSync(tempFolderPath, { recursive: true });

      await fs
        .createReadStream(zipFilePath)
        .pipe(unzipper.Extract({ path: tempFolderPath }))
        .promise();

      finalFolderPath = tempFolderPath;
    }

    // ✅ 4) Upload local folder → GitHub repo
    await ProjectUploader(finalFolderPath, repoUrl, commitMessage);

    // ✅ ✅ ✅ الرد النهائي (آخر سطر منطقي)
    return res.status(200).json({
      success: true,
      repoUrl: repo.htmlUrl,
      message: "Project pushed to GitHub successfully",
    });
  } catch (err) {
    console.error(err);

    // ✅ لازم return
    return res.status(500).json({
      message: "Failed",
      error: err.message || err,
    });
  } finally {
    // حذف ملف الـ ZIP اللي اتخزّن في uploads/
    if (zipFilePath) {
      try {
        await fs.promises.unlink(zipFilePath);
      } catch (e) {
        console.error("Failed to remove uploaded zip file:", e.message);
      }
    }

    // حذف الفولدر المؤقت اللي فكينا فيه الضغط (temp/xxxxxx)
    if (tempFolderPath) {
      try {
        await fs.promises.rm(tempFolderPath, {
          recursive: true,
          force: true,
        });
      } catch (e) {
        console.error("Failed to remove temp folder:", e.message);
      }
    }
  }
};

// get vercel deployments
export const getVercelDeployments = async (req, res, next) => {
  const { userData } = req;

  if (!userData) {
    return next(new Error("userData not found", { cause: 401 }));
  }

  const userCheck = await userModel.findById(userData.id);

  if (!userCheck) {
    return next(new Error("user not exist", { cause: 404 }));
  }

  const response = await fetch("https://api.vercel.com/v9/projects", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userCheck.vercelToken}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  res.json(data);
};

// import from github to vercel
export const importToVercel = async (req, res, next) => {
  const { name, repoId } = req.body;
  const { userData } = req;

  if (!userData) {
    return next(new Error("userData not found", { cause: 401 }));
  }

  const userCheck = await userModel.findById(userData.id);

  if (!userCheck) {
    return next(new Error("user not exist", { cause: 404 }));
  }

  if (!name || !repoId) {
    return next(new Error("name or RepoId not found", { cause: 400 }));
  }

  const response = await fetch("https://api.vercel.com/v9/projects", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userCheck.vercelToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      gitRepository: {
        type: "github",
        repoId,
      },
    }),
  });

  const data = await response.json();
  res.json(data);
};

// deploy to vercel
export const deployToVercel = async (req, res, next) => {
  const userData = req.userData;
  const { repoName, repoId, branch } = req.body;

  if (!userData || !repoName || !repoId || !branch) {
    return next(new Error("Data missing", { cause: 400 }));
  }

  const userCheck = await userModel.findById(userData._id);
  if (!userCheck) {
    return next(new Error("user not found", { cause: 404 }));
  }

  const vercelToken = userCheck.vercelToken;
  if (!vercelToken) {
    return res.status(500).json({ error: "Missing VERCEL_TOKEN in .env" });
  }

  const payload = {
    name: repoName,
    gitSource: {
      type: "github",
      repoId,
      ref: branch,
    },
  };

  const response = await fetch(
    "https://api.vercel.com/v13/deployments?skipAutoDetectionConfirmation=1",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    return res
      .status(response.status)
      .json({ error: data.error?.message || "Deployment failed" });
  }

  console.log("✅ Deployed successfully:", data.url);
  res.json({ liveUrl: data.url });
};

//delete repo from github
export const deleteGithubRepo = async (req, res, next) => {
  const { userData } = req;
  const { owner, repoName } = req.body;

  if (!owner || !repoName) {
    return next(new Error("owner and repoName are required", { cause: 400 }));
  }

  const userCheck = await userModel.findById(userData._id);
  if (!userCheck) {
    return next(new Error("User not found"));
  }

  const token = userCheck.githubToken;

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  //  GitHub لو نجحت العملية بيرجع 204 No Content
  if (response.status === 204) {
    return res.json({ msg: "✅ Repository deleted successfully" });
  }

  const data = await response.json();

  return res.status(response.status).json({
    error: data.message || "Deleting failed",
  });
};

//delete vercel project
export const cancelDeployToVercel = async (req, res, next) => {
  const { projectId } = req.params;
  const { userData } = req;

  if (!userData) {
    return next(new Error("userData not found", { cause: 401 }));
  }

  const userCheck = await userModel.findById(userData.id);

  if (!userCheck) {
    return next(new Error("user not exist", { cause: 404 }));
  }

  if (!projectId) {
    return next(new Error("projectId is required", { cause: 400 }));
  }

  const url = `https://api.vercel.com/v9/projects/${projectId}?force=true`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${userCheck.vercelToken}`,
      "Content-Type": "application/json",
    },
  });

  let data = null;

  // تأكد إن فيه body قبل ما تعمله JSON.parse
  const text = await response.text();
  if (text) {
    data = JSON.parse(text);
  }

  if (!response.ok) {
    return res.status(response.status).json({
      error: data?.error?.message || "Deleting failed",
    });
  }

  return res.json({
    msg: "✅ Vercel project deleted successfully",
  });
};

//------------------------- management ----------------------

// add project
export const addProject = async (req, res, next) => {
  const { userData } = req;
  const {
    name,
    description,
    githubUrl,
    vercelUrl,
    image,
    isDeployed,
    isFeatured,
    isProfiled,
    isComplete,
    language,
  } = req.body;

  if (!userData) {
    return next(new Error("userData not found", { cause: 401 }));
  }

  if (!name || !githubUrl) {
    return next(new Error("data missing", { cause: 400 }));
  }

  const userCheck = await userModel.findById(userData._id);
  if (!userCheck) {
    return next(new Error("User not found"));
  }

  const newProject = projectModel.create({
    userId: userData._id,
    name,
    description,
    githubUrl,
    vercelUrl,
    image,
    isDeployed,
    isFeatured,
    isProfiled,
    isComplete,
    language,
  });

  if (newProject) {
    return res
      .status(200)
      .json({ msg: "the project created successfully", newProject });
  }
  next(new Error("failed to create the project", { cause: 500 }));
};

// update project
export const updateProject = async (req, res, next) => {
  const { projectId } = req.params;
  const updateData = req.body;

  if (!projectId) {
    return next(new Error("projectId is required", { cause: 400 }));
  }

  const project = await projectModel.findById(projectId);
  if (!project) {
    return next(new Error("Project not found", { cause: 404 }));
  }

  // if there is a file to upload
  if (req.file?.path) {
    if (project.image.public_id) {
      await cloudinary.uploader.destroy(project.image.public_id);
    }

    // upload للصورة باستخدام await
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `PortaDeploy/projects/${project.name}/image`,
        unique_filename: true,
      }
    );

    updateData.image = { public_id, secure_url };
  }

  const updatedProject = await projectModel.findByIdAndUpdate(
    projectId,
    updateData,
    { new: true }
  );

  if (!updatedProject) {
    return next(new Error("Project not found", { cause: 404 }));
  }

  res.json({ msg: "Project updated successfully", updatedProject });
};

// get all projects by userId
export const getAllProjects = async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new Error("userId not found", { cause: 401 }));
  }
  const projects = await projectModel.find({ userId: userId });
  if (!projects) {
    return next(new Error("No projects found", { cause: 404 }));
  }
  res.json({ msg: "projects found successfully", projects });
};

// get all projects by Token
export const getAllProjectsByToken = async (req, res, next) => {
  const { id } = req.userData;

  if (!id) {
    return next(new Error("userId not found", { cause: 401 }));
  }
  const projects = await projectModel.find({ userId: id });
  if (!projects) {
    return next(new Error("No projects found", { cause: 404 }));
  }
  res.json({ msg: "projects found successfully", projects });
};

// get user projects
export const getUserProjects = async (req, res, next) => {
  const { userData } = req;

  if (!userData) {
    return next(new Error("userData not found", { cause: 401 }));
  }

  const userProjects = await projectModel.find({ userId: userData._id });
  res.json({ projects: userProjects });
};

// get project by id
export const getProjectById = async (req, res, next) => {
  const { projectId } = req.params;

  if (!projectId) {
    return next(new Error("projectId is required", { cause: 400 }));
  }

  const project = await projectModel.findById(projectId);

  if (!project) {
    return next(new Error("Project not found", { cause: 404 }));
  }

  res.json({ project });
};

// delete project
export const deleteProject = async (req, res, next) => {
  const { projectId } = req.params;

  if (!projectId) {
    return next(new Error("projectId is required", { cause: 400 }));
  }

  const project = await projectModel.findById(projectId);
  if (!project) {
    return next(new Error("Project not found", { cause: 404 }));
  }

  // delete image from cloudinary
  if (project.image && project.image.public_id) {
    try {
      await cloudinary.uploader.destroy(project.image.public_id);
    } catch (err) {
      return next(
        new Error("Failed to delete project image from Cloudinary", {
          cause: 500,
        })
      );
    }
  }

  const deletedProject = await projectModel.findByIdAndDelete(projectId);

  if (!deletedProject) {
    return next(new Error("Project not found", { cause: 404 }));
  }

  res.json({ msg: "Project deleted successfully", deletedProject });
};
