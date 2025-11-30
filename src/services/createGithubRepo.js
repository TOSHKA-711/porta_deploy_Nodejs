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
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github+json",
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
    console.error(err.response?.data || err);
    return {
      success: false,
      error: err.response?.data || err.message,
    };
  }
};
