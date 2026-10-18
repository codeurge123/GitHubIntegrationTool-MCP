export function registerGitWorkflowPrompt(server) {
    server.registerPrompt(
        'git-to-raise-pr-workflow',
        {
            title: 'Git to Raise PR Workflow',
            description: 'A workflow to inspect a local Git repository, stage changes, commit them, create a feature branch, push it to origin, and raise a pull request on GitHub.',
        }, async () => {
            return {
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `I want to raise a pull request for my changes in the local Git repository. Please guide me through the workflow. 
                            Step 1: Inspect the repository and show me the current status of changes.
                            Step 2: Stage the changes I want to include in the pull request.
                            Step 3: Commit the staged changes with a commit message.
                            Step 4: Create a new feature branch for the pull request.
                            Step 5: Push the feature branch to the remote repository.
                            Step 6: Raise a pull request on GitHub from the feature branch to the target branch.`

                        }
                    }
                ]
            }
        }
    )
}
