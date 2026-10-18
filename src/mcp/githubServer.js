import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAllTools } from "../tools/index.js";
import { registerGitWorkflowPrompt } from "../prompts/gitWorkflow.js";

export const githubMcpServer = () => {
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

    registerAllTools(server);
    registerGitWorkflowPrompt(server);

    return server;
}
