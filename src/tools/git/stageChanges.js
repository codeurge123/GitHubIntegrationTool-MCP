import { z } from "zod";
import { runGit, getCurrentBranch } from "../../utils/git.js";
import { textResult } from "../../utils/textResult.js";

export function registerStageChanges(server) {
    server.registerTool(
        "stage_changes",
        {
            description:
                "Stage all changed and untracked files in the current Git repository.",

            inputSchema: {
                localPath: z.string().describe(
                    "Absolute path to the local Git repository"
                ),

                approved: z.literal(true).describe(
                    "User must approve staging all changed files"
                )
            }
        },

        async ({ localPath, approved }) => {
            if (!approved) {
                throw new Error("User approval is required.");
            }

            // Step 1: Identify the current branch.
            const branch = await getCurrentBranch(localPath);

            // Step 2: Check the repository status before staging.
            const { stdout: beforeStatus } = await runGit(localPath, [
                "status",
                "--short"
            ]);

            if (!beforeStatus) {
                return textResult({
                    message: "No changes to stage.",
                    currentBranch: branch,
                    stagedFiles: []
                });
            }

            // Step 3: Stage all changes, including untracked files.
            await runGit(localPath, [
                "add",
                "-A"
            ]);

            // Step 4: Get the staged file list.
            const { stdout: staged } = await runGit(localPath, [
                "diff",
                "--cached",
                "--name-only"
            ]);

            return textResult({
                message: "All changes staged successfully.",
                currentBranch: branch,
                stagedFiles: staged
                    .split("\n")
                    .filter(Boolean)
            });
        }
    );
}
