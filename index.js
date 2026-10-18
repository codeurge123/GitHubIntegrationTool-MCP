import './src/config/env.js';
import { githubMcpServer } from './src/mcp/githubServer.js';
import { createApp } from './src/app.js';

const port = 3000;

const server = githubMcpServer();
const app = createApp(server);

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
})
