import axios from 'axios';
import { z } from "zod";

export function registerRaiseIssue(server) {
    server.registerTool(
        "raiseIssue",
        {
            description: "This tool allows you to raise an issue in a specified GitHub repository. You need to provide the owner of the repository, the repository name, the title of the issue, and the body of the issue.",
            inputSchema: {
                owner: z.string().describe("The GitHub username"),
                repo: z.string().describe("Repo name"),
                title: z.string().describe("The title of the issue"),
                body: z.string().describe("The body of the issue")
            }
        }, async ({ owner, repo, title, body }) => {

            // STEP 1: Test authentication
            const user = await axios.get(
                "https://api.github.com/user",
                {
                    headers: {
                        Authorization: `Bearer ${process.env.GITHUB_API_LOGIN}`,
                        Accept: "application/vnd.github+json",
                        "X-GitHub-Api-Version": "2022-11-28",
                    },
                }
            );

            console.log("AUTHENTICATED AS:", user.data.login);


            // maybe there will be the error in the below api calling.
            // there is just a small bug the axios.post(url,data,config); and i am doing the axios.post(url,config,data);
            const response = await axios.post(`https://api.github.com/repos/${owner}/${repo}/issues`,
                {
                    // Payload for creating an issue
                    title: title,
                    body: body,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.GITHUB_API_LOGIN}`,
                        Accept: "application/vnd.github+json",
                        "X-GitHub-Api-Version": "2022-11-28"
                    },
                })


            if (!response.ok) {
                throw new Error(`Failed to raise issue: ${response.status} ${response.statusText}`);
            }

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(response.data)
                    }
                ]
            }

        }
    )
}
