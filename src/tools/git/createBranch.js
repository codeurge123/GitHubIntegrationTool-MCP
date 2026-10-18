import { z } from "zod";
import { runGit } from "../../utils/git.js";
import { textResult } from "../../utils/textResult.js";

export function registerCreateBranch(server) {
    server.registerTool(
        "create_branch",
        {
            description:
                "Create and switch to a new feature branch after approval.",

            inputSchema: {
                localPath: z.string(),
                branchName: z.string().regex(
                    /^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/
                ),
                approved: z.literal(true)
            }
        },

        async ({ localPath, branchName, approved }) => {
            if (!approved) {
                throw new Error("Branch creation requires approval.");
            }

            if (
                branchName.startsWith("-") ||
                branchName.includes("..") ||
                branchName.endsWith("/") ||
                branchName.endsWith(".") ||
                branchName.includes("//") ||
                branchName.includes("@{")
            ) {
                throw new Error("Invalid branch name.");
            }

            const current = await runGit(localPath, [
                "branch",
                "--show-current"
            ]);

            if (current.stdout === branchName) {
                return textResult({
                    message: "Already on the requested branch.",
                    branch: branchName
                });
            }

            await runGit(localPath, [
                "check-ref-format",
                "--branch",
                branchName
            ]);

            const existing = await runGit(localPath, [
                "branch",
                "--list",
                branchName
            ]);

            if (existing.stdout) {
                throw new Error(
                    "Branch already exists. Inspect it before switching."
                );
            }

            await runGit(localPath, [
                "switch",
                "-c",
                branchName
            ]);

            return textResult({
                message: "Feature branch created.",
                previousBranch: current.stdout,
                currentBranch: branchName
            });
        }
    );
}
