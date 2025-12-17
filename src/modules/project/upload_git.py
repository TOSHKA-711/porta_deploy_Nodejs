import subprocess
import sys
import os
import time


def run(cmd, check=True):
    """Run shell commands and print everything"""
    print(f"\n🔹 Running: {' '.join(cmd)}")
    sys.stdout.flush()

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.stdout:
        print("🟢 STDOUT:", result.stdout.strip())
        sys.stdout.flush()

    if result.stderr:
        print("🔴 STDERR:", result.stderr.strip())
        sys.stderr.flush()

    if check and result.returncode != 0:
        raise Exception(
            f"❌ Command failed: {' '.join(cmd)}\nError: {result.stderr.strip()}"
        )

    return result


def upload_git(folder_path, repo_url, commit_message="Initial commit"):
    print("\n============================================")
    sys.stdout.flush()
    print("🚀 Starting Git upload process…")
    sys.stdout.flush()
    print("Folder:", folder_path)
    sys.stdout.flush()
    print("Repo URL:", repo_url.replace(repo_url[13:33], "***TOKEN-HIDDEN***"))
    sys.stdout.flush()
    print("============================================\n")
    sys.stdout.flush()

    # CHANGE FOLDER
    os.chdir(folder_path)

    # step 1 — user config
    print("\n🔹 Setting user config…")
    run(["git", "config", "user.email", "deploy@porta.io"], check=False)
    run(["git", "config", "user.name", "PortaDeploy"], check=False)

    # step 2 — init repo
    print("\n🔹 Initializing repo…")
    run(["git", "init"], check=False)

    # step 3 — force main branch
    print("\n🔹 Switching to main branch…")
    run(["git", "checkout", "-B", "main"], check=False)

    # step 4 — clean remote origin
    print("\n🔹 Cleaning old remotes…")
    run(["git", "remote", "remove", "origin"], check=False)

    # step 5 — re-add remote origin
    print("\n🔹 Adding remote origin…")
    run(["git", "remote", "add", "origin", repo_url])

    # step 6 — add files
    print("\n🔹 Staging files…")
    run(["git", "add", "-A"])

    # step 7 — check if commit needed
    print("\n🔹 Checking changes…")
    status = run(["git", "status", "--porcelain"], check=False)

    if status.stdout.strip():
        print("\n🟢 Changes detected → committing…")
        run(["git", "commit", "-m", commit_message])
    else:
        print("\n⚠️ No changes detected → skipping commit")

    # step 8 — test push without force
    print("\n🔹 Attempting normal push…")
    normal_push = run(
        ["git", "push", "-u", "origin", "main"],
        check=False
    )

    if normal_push.returncode == 0:
        print("\n🟢 Normal push succeeded!")
        return True

    print("\n⚠️ Normal push failed → trying force push…")

    # FOR ERROR MESSAGE BEFORE FORCE
    print("🔴 Failure reason:")
    print(normal_push.stderr.strip())

    # step 9 — force push
    forced = run(
        ["git", "push", "-u", "origin", "main", "--force"],
        check=False
    )

    if forced.returncode == 0:
        print("\n🟢 Force push success!")
        return True

    print("\n❌ Force push failed too.")
    print("🔻 error:", forced.stderr.strip())

    raise Exception("Git push failed completely.")


if __name__ == "__main__":
    # Immediate output to confirm script started
    print("Python script started!", flush=True)
    sys.stdout.flush()

    if len(sys.argv) < 3:
        print("Usage: python upload_git.py <folder_path> <repo_url> [commit_message]", flush=True)
        sys.exit(1)

    folder = sys.argv[1]
    repo = sys.argv[2]
    message = sys.argv[3] if len(sys.argv) > 3 else "Upload via PortaDeploy"

    print(f"Received arguments: folder={folder}, repo={repo[:50]}..., message={message}", flush=True)
    sys.stdout.flush()

    try:
        upload_git(folder, repo, message)
        print("\n==============================", flush=True)
        print("🎉 Upload completed successfully!", flush=True)
        print("==============================", flush=True)
        sys.stdout.flush()
    except Exception as e:
        print("\n==============================", flush=True)
        print("❌ Upload FAILED!", flush=True)
        print("Reason:", str(e), flush=True)
        print("==============================", flush=True)
        sys.stderr.flush()
        sys.exit(1)
