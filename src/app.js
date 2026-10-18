import express from 'express';
import cors from 'cors';
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

export const createApp = (server) => {
    const app = express();
    app.use(cors());
    app.use(express.json());

    app.get('/', (req, res) => {
        res.json({
            message: "Server is running",
            // api: process.env.GITHUB_API_LOGIN // testing
        })
    })

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

    return app;
}
