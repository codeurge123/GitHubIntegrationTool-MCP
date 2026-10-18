import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import fs from "node:fs/promises";

// runGit is the helper function to execute shell commands and check repo before raising PR
const execFileAsync = promisify(execFile);

export async function runGit(localPath, args) {
    const repoPath = path.resolve(localPath);

    // Verify that the supplied directory exists.
    const stat = await fs.stat(repoPath);

    if (!stat.isDirectory()) {
        throw new Error("localPath must be a directory");
    }

    // Verify that it is a Git repository.
    await execFileAsync(
        "git",
        ["rev-parse", "--show-toplevel"],
        { cwd: repoPath }
    );

    // Execute Git with individual arguments, not a shell string.
    const { stdout, stderr } = await execFileAsync(
        "git",
        args,
        {
            cwd: repoPath,
            maxBuffer: 10 * 1024 * 1024
        }
    );

    return {
        stdout: stdout.trim(),
        stderr: stderr.trim()
    };
}

export async function getCurrentBranch(localPath) {
    const { stdout } = await runGit(localPath, [
        "branch",
        "--show-current"
    ]);

    if (!stdout) {
        throw new Error(
            "No branch is currently checked out (detached HEAD)."
        );
    }

    return stdout;
}
