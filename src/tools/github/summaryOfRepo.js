import axios from 'axios';
import { z } from "zod";

export function registerSummaryOfRepo(server) {
    server.registerTool(
        "SummaryOfRepo",
        {
            description : "Get the summary of a given repository including the number of commits, branches, pull requests, and issues.",
            inputSchema: {
                owner: z.string().describe("The GitHub username"),
                repo: z.string().describe("The repository name"),
            }
        }, async ({owner, repo}) => {

            const [commitsResponse, branchesResponse, prsResponse, issuesResponse] = await Promise.all([
                axios.get(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`),
                axios.get(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=1`),
                axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls?per_page=1`),
                axios.get(`https://api.github.com/repos/${owner}/${repo}/issues?per_page=1`)
            ]);

            // summary of the repo by reading the readme.md
            const readmeResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/readme`);

            const summary = {
                commits: commitsResponse.headers['link'] ? parseInt(commitsResponse.headers['link'].match(/&page=(\d+)>; rel="last"/)[1]) : commitsResponse.data.length,
                branches: branchesResponse.headers['link'] ? parseInt(branchesResponse.headers['link'].match(/&page=(\d+)>; rel="last"/)[1]) : branchesResponse.data.length,
                pullRequests: prsResponse.headers['link'] ? parseInt(prsResponse.headers['link'].match(/&page=(\d+)>; rel="last"/)[1]) : prsResponse.data.length,
                issues: issuesResponse.headers['link'] ? parseInt(issuesResponse.headers['link'].match(/&page=(\d+)>; rel="last"/)[1]) : issuesResponse.data.length,
                readme: readmeResponse.data.content ? Buffer.from(readmeResponse.data.content, 'base64').toString('utf-8') : "No README found"
            };

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(summary, null, 2)
                    }
                ]
            };


        }
    )
}
