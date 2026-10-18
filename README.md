# GitHub MCP Server

A Model Context Protocol (MCP) server that exposes GitHub and local Git operations as MCP tools over HTTP. Built with Express and the official [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk), served via the Streamable HTTP transport.

## Features

- **11 MCP tools** covering GitHub API operations and a local Git workflow
- **1 MCP prompt** that guides an agent through the full inspect → stage → commit → branch → push → PR flow
- **Streamable HTTP transport** at `POST /mcp` (stateless, no session tracking)

## Prerequisites

- Node.js 18+
- A GitHub personal access token with appropriate scopes (repo access for issues/PRs)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create a .env file in the project root
echo "GITHUB_API_LOGIN=<your_github_token>" > .env

# 3. Start the server
npm run dev
```

The server starts on `http://localhost:3000`.

### Environment Variables

| Variable            | Description                                              |
| ------------------- | -------------------------------------------------------- |
| `GITHUB_API_LOGIN`  | GitHub personal access token, used as a Bearer token for authenticated API calls (creating issues and pull requests) |

> Tools that only read public data (`giveRepoCount`, `latestCommit`, `SummaryOfRepo`, `listLastestPRAndIssuesWithLabel`) work without a token. Tools that write (`raiseIssue`, `raisePR`) require it.

## Endpoints

| Method | Path    | Description                                      |
| ------ | ------- | ------------------------------------------------ |
| GET    | `/`     | Health check                                     |
| GET    | `/mcp`  | MCP server status                                |
| POST   | `/mcp`  | MCP endpoint — send JSON-RPC requests here       |

## Tools

### GitHub API tools

| Tool                            | Description                                                                                     | Key inputs                          |
| ------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------- |
| `giveRepoCount`                 | Get the number of repositories for a given GitHub user                                          | `owner`                             |
| `listLastestPRAndIssuesWithLabel` | List the 5 most recently updated pull requests or issues for a repository                     | `owner`, `repo`, `Ask` (PR/Issue)   |
| `raiseIssue`                    | Create an issue in a repository (authenticated)                                                 | `owner`, `repo`, `title`, `body`    |
| `latestCommit`                  | Get the top-k most recent commits for a repository                                              | `owner`, `repo`, `topk`             |
| `raisePR`                       | Create a pull request from a feature branch into a base branch (authenticated)                  | `owner`, `repo`, `head`, `base`, `title`, `body`, `approved` |
| `SummaryOfRepo`                 | Summarize a repository: commits, branches, PRs, issues count, plus the README content           | `owner`, `repo`                     |

### Local Git workflow tools

These operate on a local repository on disk. `localPath` must be an absolute path to a Git repository.

| Tool                 | Description                                                                  | Key inputs                          |
| -------------------- | ---------------------------------------------------------------------------- | ----------------------------------- |
| `inspect_repository` | Return current branch, remote URL, working-tree changes, and status          | `owner`, `repo`, `localPath`        |
| `stage_changes`      | Stage all changed and untracked files                                        | `localPath`, `approved`             |
| `commit_changes`     | Commit staged changes on the current branch                                  | `localPath`, `message`, `approved`  |
| `create_branch`      | Create and switch to a new feature branch                                    | `localPath`, `branchName`, `approved` |
| `push_branch`        | Push the current feature branch to `origin` with upstream tracking           | `localPath`, `approved`             |

> The destructive tools (`stage_changes`, `commit_changes`, `create_branch`, `push_branch`, `raisePR`) require an explicit `approved: true` argument as a safety gate.

## Prompts

| Prompt                    | Description                                                                                                    |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `git-to-raise-pr-workflow` | A step-by-step workflow prompt: inspect the repo, stage changes, commit, create a branch, push, and raise a PR |

## Usage Example

Once connected to an MCP client (e.g. Claude Desktop, or any Streamable HTTP MCP client) pointed at `http://localhost:3000/mcp`:

```
User: How many repositories does "octocat" have?
Model: calls giveRepoCount with { "owner": "octocat" }

User: Raise a PR from my feature branch.
Model: calls raisePR with { "owner": "...", "repo": "...", "head": "feature-x", "base": "main", "title": "...", "body": "...", "approved": true }
```

You can also call the endpoint directly:

```bash
curl -X POST http://localhost:3000/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

## Project Structure

```
index.js                        # Bootstrap: loads env, wires MCP server + Express, listens
src/
├── config/env.js               # dotenv configuration
├── app.js                      # Express app, CORS, JSON body parsing, /mcp routes
├── mcp/githubServer.js         # McpServer factory — registers all tools and prompts
├── prompts/gitWorkflow.js      # git-to-raise-pr-workflow prompt
├── tools/
│   ├── index.js                # Aggregates and registers every tool
│   ├── github/                 # Tools backed by the GitHub REST API
│   │   ├── repoCount.js
│   │   ├── listPrsAndIssues.js
│   │   ├── raiseIssue.js
│   │   ├── latestCommit.js
│   │   ├── raisePR.js
│   │   └── summaryOfRepo.js
│   └── git/                    # Tools that shell out to a local git binary
│       ├── inspectRepository.js
│       ├── stageChanges.js
│       ├── commitChanges.js
│       ├── createBranch.js
│       └── pushBranch.js
└── utils/
    ├── git.js                  # runGit / getCurrentBranch helpers (safe execFile wrapper)
    └── textResult.js           # Standard MCP text-content response formatter
```

## Scripts

| Command     | Description                        |
| ----------- | ---------------------------------- |
| `npm run dev` | Start the server with hot reload (nodemon) |

## License

ISC
