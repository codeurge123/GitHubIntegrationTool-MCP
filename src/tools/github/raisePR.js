import axios from 'axios';
import { z } from "zod";
import { textResult } from "../../utils/textResult.js";

export function registerRaisePR(server) {
    server.registerTool(
        "raisePR",
        {
            description:
                "Create a GitHub pull request from a pushed feature branch " +
                "into a target branch after explicit approval.",

            inputSchema: {
                owner: z.string().min(1),
                repo: z.string().min(1),
                head: z.string().min(1).describe(
                    "Source feature branch"
                ),
                base: z.string().min(1).describe(
                    "Target branch, such as main"
                ),
                title: z.string().min(1),
                body: z.string(),
                approved: z.literal(true)
            }
        },

        async ({
            owner,
            repo,
            head,
            base,
            title,
            body,
            approved
        }) => {
            if (!approved) {
                throw new Error("PR creation requires approval.");
            }

            if (!process.env.GITHUB_API_LOGIN) {
                throw new Error(
                    "GITHUB_API_LOGIN is missing from the environment."
                );
            }

            if (head === base) {
                throw new Error(
                    "Source and target branches must be different."
                );
            }

            // this api endpoint is used to create a pr on github
            const response = await axios.post(
                `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls`,
                {
                    title,
                    body,
                    head,
                    base
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${process.env.GITHUB_API_LOGIN}`,
                        Accept: "application/vnd.github+json",
                        "X-GitHub-Api-Version": "2022-11-28"
                    }
                }
            );

            return textResult({
                message: "Pull request created successfully.",
                number: response.data.number,
                title: response.data.title,
                state: response.data.state,
                url: response.data.html_url,
                head: response.data.head.ref,
                base: response.data.base.ref
            });
        }
    );
}
