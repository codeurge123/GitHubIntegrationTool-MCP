import { z } from "zod";
import path from "node:path";
import { runGit } from "../../utils/git.js";
import { textResult } from "../../utils/textResult.js";

export function registerInspectRepository(server) {
    server.registerTool(
        "inspect_repository",
        {
            description:
                "Inspect a local Git repository and return its current branch, " +
                "remote URL, working-tree changes, staged changes, and status.",

            inputSchema: {
                owner: z.string().describe("GitHub repository owner"),
                repo: z.string().describe("GitHub repository name"),
                localPath: z.string().describe("Absolute local repository path")
            }
        },

        async ({ owner, repo, localPath }) => {
            const [branch, status, remote] = await Promise.all([
                runGit(localPath, [
                    "branch",
                    "--show-current"
                ]),

                runGit(localPath, [
                    "status",
                    "--porcelain=v1",
                    "--branch"
                ]),

                runGit(localPath, [
                    "remote",
                    "get-url",
                    "origin"
                ])
            ]);

            const lines = status.stdout
                .split("\n")
                .filter(Boolean);

            const files = lines
                .filter(line => !line.startsWith("##"))
                .map(line => ({
                    statusCode: line.slice(0, 2),
                    path: line.slice(3)
                }));

            return textResult({
                owner,
                repo,
                localPath: path.resolve(localPath),
                currentBranch: branch.stdout,
                remoteUrl: remote.stdout,
                status: status.stdout,
                files,
                nextStep:
                    "Review the files and select which ones to stage."
            });
        }
    );
}
