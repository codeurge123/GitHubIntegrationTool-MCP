import { registerGiveRepoCount } from "./github/repoCount.js";
import { registerListLatestPRAndIssuesWithLabel } from "./github/listPrsAndIssues.js";
import { registerRaiseIssue } from "./github/raiseIssue.js";
import { registerLatestCommit } from "./github/latestCommit.js";
import { registerRaisePR } from "./github/raisePR.js";
import { registerSummaryOfRepo } from "./github/summaryOfRepo.js";
import { registerInspectRepository } from "./git/inspectRepository.js";
import { registerStageChanges } from "./git/stageChanges.js";
import { registerCommitChanges } from "./git/commitChanges.js";
import { registerCreateBranch } from "./git/createBranch.js";
import { registerPushBranch } from "./git/pushBranch.js";

export function registerAllTools(server) {
    // GitHub API tools
    registerGiveRepoCount(server);
    registerListLatestPRAndIssuesWithLabel(server);
    registerRaiseIssue(server);
    registerLatestCommit(server);
    registerRaisePR(server);
    registerSummaryOfRepo(server);

    // Local Git workflow tools
    // for implementing the raisePR tools we have to implement few more tools like inspect_repository, stage_changes, get_staged_diff, commit_changes, push_branch and raisePR
    registerInspectRepository(server);
    registerStageChanges(server);
    registerCommitChanges(server);
    registerCreateBranch(server);
    registerPushBranch(server);
}
