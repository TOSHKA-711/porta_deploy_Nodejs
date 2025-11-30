import os
import sys
import subprocess

def main():
    if len(sys.argv) < 4:
        print("Usage: python upload_git.py <folder_path> <repo_url> <commit_message>")
        sys.exit(1)

    folder_path = sys.argv[1]
    repo_url = sys.argv[2]
    commit_msg = sys.argv[3] 

    if not os.path.exists(folder_path):
        print(f"Folder does not exist: {folder_path}")
        sys.exit(1)

    os.chdir(folder_path)

    try:
        subprocess.run(["git", "init"], check=True)

        # تحقق من remote
        remotes = subprocess.run(["git", "remote"], capture_output=True, text=True)
        if "origin" in remotes.stdout:
            subprocess.run(["git", "remote", "set-url", "origin", repo_url], check=True)
        else:
            subprocess.run(["git", "remote", "add", "origin", repo_url], check=True)

        subprocess.run(["git", "add", "."], check=True)

        # تحقق لو فيه تغييرات قبل commit
        status = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
        if status.stdout.strip() != "":
            subprocess.run(["git", "commit", "-m", commit_msg], check=True)
        else:
            print("Nothing to commit, skipping commit step.")

        subprocess.run(["git", "branch", "-M", "main"], check=True)
        subprocess.run(["git", "push", "-u", "origin", "main"], check=True)
        print("Success: Project pushed to GitHub")

    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
