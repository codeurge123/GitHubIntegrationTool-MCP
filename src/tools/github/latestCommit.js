import axios from 'axios';
import { z } from "zod";

export function registerLatestCommit(server) {
    server.registerTool(
        "latestCommit",
        {
            description: "Get the latest commit for a given repository",
            inputSchema: {
                owner: z.string().describe("The GitHub username"),
                repo: z.string().describe("The repository name"),
                topk: z.number().describe("Give the top k Commits")
            }
        }, async ({ owner, repo, topk }) => {

            const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=${topk}`);



            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(response.data.map(c => {
                            return {
                                commitId: c.sha,
                                commitBy: c.author.login,
                                commitUrl: c.html_url,
                            }
                        }))
                    }
                ]
            };

        }
    )
}
