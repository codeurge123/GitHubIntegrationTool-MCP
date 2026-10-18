import { z } from "zod";
import { runGit, getCurrentBranch } from "../../utils/git.js";
import { textResult } from "../../utils/textResult.js";

export function registerCommitChanges(server) {
    server.registerTool(
        "commit_changes",
        {
            description:
                "Commit staged changes on the current Git branch.",

            inputSchema: {
                localPath: z.string(),

                message: z.string().trim().min(1),

                approved: z.literal(true).describe(
                    "User has approved this commit"
                )
            }
        },

        async ({ localPath, message, approved }) => {
            if (!approved) {
                throw new Error("Commit approval is required.");
            }

            // Step 1: Identify the current branch.
            const branch = await getCurrentBranch(localPath);

            // Step 2: Ensure there are staged changes.
            const { stdout: staged } = await runGit(localPath, [
                "diff",
                "--cached",
                "--name-only"
            ]);

            if (!staged) {
                throw new Error(
                    "No staged changes. Stage files before committing."
                );
            }

            // Step 3: Get the staged diff for review.
            const { stdout: diff } = await runGit(localPath, [
                "diff",
                "--cached"
            ]);

            if (!diff) {
                throw new Error("The staged diff is empty.");
            }

            // Step 4: Commit on the current branch.
            await runGit(localPath, [
                "commit",
                "-m",
                message
            ]);

            // Step 5: Return the commit details.
            const { stdout: commitHash } = await runGit(localPath, [
                "rev-parse",
                "HEAD"
            ]);

            return textResult({
                message: "Commit created successfully.",
                currentBranch: branch,
                commitMessage: message,
                commitHash,
                files: staged.split("\n").filter(Boolean)
            });
        }
    );
}
