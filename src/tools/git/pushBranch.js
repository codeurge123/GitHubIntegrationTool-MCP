import { z } from "zod";
import { runGit } from "../../utils/git.js";
import { textResult } from "../../utils/textResult.js";

export function registerPushBranch(server) {
    server.registerTool(
        "push_branch",
        {
            description:
                "Push the current feature branch to origin after approval.",

            inputSchema: {
                localPath: z.string(),
                approved: z.literal(true)
            }
        },

        async ({ localPath, approved }) => {
            if (!approved) {
                throw new Error("Push approval is required.");
            }

            const branch = await runGit(localPath, [
                "branch",
                "--show-current"
            ]);

            if (!branch.stdout ||
                ["main", "master"].includes(branch.stdout)) {
                throw new Error(
                    "Push is allowed only from a named feature branch."
                );
            }

            const remote = await runGit(localPath, [
                "remote",
                "get-url",
                "origin"
            ]);

            const commit = await runGit(localPath, [
                "rev-parse",
                "HEAD"
            ]);

            await runGit(localPath, [
                "push",
                "--set-upstream",
                "origin",
                branch.stdout
            ]);

            return textResult({
                message: "Branch pushed successfully.",
                branch: branch.stdout,
                remote: remote.stdout,
                commitHash: commit.stdout
            });
        }
    );
}
