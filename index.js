import express from 'express';
import cors from 'cors';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({
    path: '.env',
});

const port = 3000;

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: "Server is running",
        // api: process.env.GITHUB_API_LOGIN // testing
    })
})


const githubMcpServer = () => {
    const server = new McpServer({
        name: "Github-mcp-server",
        version: "1.0.0",
    },
        // {
        //     capabilities: {
        //         tools: {},
        //         resources: {},
        //         prompts: {},
        //     }
        // }
    );


    // tool

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



    // raisePR, registerPrompts to complete the workflow of raisePR and git cmd, reigsterResource for proper git doc
    server.registerTool(
        "inspect_repository",
        {
            description: "Inspect the details of a GitHub repository",
            inputSchema: {
                owner: z.string().describe("The GitHub username"),
                repo: z.string().describe("The repository name"),
                localPath: z.string().describe("The local path where the repository is present in machine")
            }
        }, async ({owner, repo, localPath}) => {
            
            
            
            

        }
    )


    // make a git add,commit and push




    server.registerPrompt(
        "git-raisePR-workflow",
        {
            title: "GitHub Raise PR Workflow",
            description: "This prompt guides you through the process of raising a pull request in a GitHub repository. It will ask for the necessary information and then use the registered tools to perform the actions.",
        }, async () => {

        }
    )

    return server;

}



const server = githubMcpServer();
app.post('/mcp', async (req, res) => {
    const transport = new StreamableHTTPServerTransport({ 
        sessionIdGenerator: undefined 
    });

    try {
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
    } catch (error) {
        throw new Error(`Error handling request: ${error.message}`);
    } finally {
        transport.close();
    }


})

app.get('/mcp', (req, res) => {
    res.json({
        message: "MCP server is running"
    })
})




app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
})