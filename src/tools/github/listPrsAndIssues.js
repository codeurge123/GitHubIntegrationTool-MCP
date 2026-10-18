import axios from 'axios';
import { z } from "zod";

export function registerListLatestPRAndIssuesWithLabel(server) {
    server.registerTool(
        "listLastestPRAndIssuesWithLabel",
        {
            description: "List the latest pull requests and issues for a given repository with a specific label",
            inputSchema: {
                owner: z.string().describe("The GitHub username"),
                repo: z.string().describe("The repository name"),
                Ask: z.enum(["PR", "Issue"]).describe("Choose whether to list pull requests or issues"),
            }
        }, async ({ owner, repo, Ask }) => {
            if (Ask === "PR") {
                // give the latest 5 Updated PR 
                const response = await axios.get(`https://api.github.com/search/issues?q=repo:${owner}/${repo}+is:pr&sort=updated&order=desc&per_page=5`);

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(response.data.items.map((rep) => {
                                return {
                                    title: rep.title,
                                    raiseBy: rep.user.login,
                                    description: rep.body,
                                    status: rep.state,
                                    url: rep.html_url
                                }
                            }))
                        }
                    ]
                }

            }
            else if (Ask === "Issue") {

                const response = await axios.get(`https://api.github.com/search/issues?q=repo:${owner}/${repo}+is:issue&sort=updated&order=desc&per_page=5`);

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(response.data.items.map((rep) => {
                                return {
                                    title: rep.title,
                                    raiseBy: rep.user.login,
                                    description: rep.body,
                                    status: rep.state,
                                    url: rep.html_url
                                }
                            }))
                        }
                    ]
                }


            }
        }
    )
}
