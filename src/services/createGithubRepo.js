import axios from "axios";

export const createGitHubRepo = async (repoName, githubToken) => {
  try {
    const response = await axios.post(
      "https://api.github.com/user/repos",
      {
        name: repoName,
        private: false, // أو true لو عايزه private
      },
      {
        headers: {
          Authorization: `Bearer ${githubToken}`, // Updated to use Bearer instead of token
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    return {
      success: true,
      cloneUrl: response.data.clone_url,
      sshUrl: response.data.ssh_url,
      htmlUrl: response.data.html_url,
    };
  } catch (err) {
    // Enhanced error logging
    const errorData = err.response?.data || {};
    const errorMessage = errorData.message || err.message || "Unknown error";
    const statusCode = err.response?.status || 500;

    console.error("GitHub API Error:", {
      status: statusCode,
      message: errorMessage,
      errors: errorData.errors,
      fullError: errorData,
    });

    return {
      success: false,
      error: {
        message: errorMessage,
        status: statusCode,
        errors: errorData.errors || [],
        details: errorData,
      },
    };
  }
};
