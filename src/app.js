import express from 'express';
import cors from 'cors';
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

export const createApp = (server) => {
    const app = express();
    app.use(cors());
    app.use(express.json());

    app.get('/', (req, res) => {
        res.send({ message: "Server is running" });
    });

    app.post('/mcp', async (req, res) => {
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined
        });

        try {
            await server.connect(transport);
            await transport.handleRequest(req, res, req.body);
        } catch (error) {
            console.error("MCP request failed:", error);

            if (!res.headersSent) {
                res.status(500).json({ error: "MCP request failed" });
            }
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
