import axios from 'axios';
import { z } from "zod";

export function registerGiveRepoCount(server) {
    server.registerTool(
        "giveRepoCount",
        {
            description: "Get the number of repositories for a given Github user",
            inputSchema: {
                owner: z.string().describe("The GitHub username")
            },
        }, async ({ owner }) => {


            const response = await axios.get(`https://api.github.com/users/${owner}/repos?per_page=100`);



            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify(response.data.length)
                }]
            }

        }
    )
}
