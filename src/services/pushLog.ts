import { Octokit } from "@octokit/rest";
import * as vscode from "vscode";

export async function pushLogToGitHub(logContent: string, accessToken: string, session: vscode.AuthenticationSession) {
    const date = new Date();
    const fileName = `log${date.toISOString().split('T')[0]}.txt`; 
    const repoOwner = session.account.label;
    const repoName = "code-tracker"; 
    const branch = "main";

    const octokit = new Octokit({ auth: accessToken });

    try {
        // Check if the repository exists
        let repoCreated = false;
        try {
            console.log("Checking if repository exists...");
            await octokit.rest.repos.get({
                owner: repoOwner,
                repo: repoName,
            });
            console.log(`Repository "${repoName}" exists.`);
        } catch (error: any) {
            if (error.status === 404) {
                console.log(`Repository "${repoName}" not found. Creating repository...`);
     
                await octokit.rest.repos.createForAuthenticatedUser({
                    name: repoName,
                    private: false,
                    description: "Repository for tracking logs",
                    auto_init: true, // Initialize here witha README.md
                });
                console.log(`Repository "${repoName}" created with a README.md.`);
                repoCreated = true;
            } else {
                throw error;
            }
        }

        console.log("Pushing log file...");
        const { data: refData } = await octokit.git.getRef({
            owner: repoOwner,
            repo: repoName,
            ref: `heads/${branch}`,
        });

        const latestCommitSha = refData.object.sha;

        const { data: commitData } = await octokit.git.getCommit({
            owner: repoOwner,
            repo: repoName,
            commit_sha: latestCommitSha,
        });

        const latestTreeSha = commitData.tree.sha;

        const { data: treeData } = await octokit.git.createTree({
            owner: repoOwner,
            repo: repoName,
            base_tree: latestTreeSha,
            tree: [
                {
                    path: `logs/${fileName}`,
                    mode: "100644",
                    type: "blob",
                    content: logContent,
                },
            ],
        });

        const { data: newCommit } = await octokit.git.createCommit({
            owner: repoOwner,
            repo: repoName,
            message: `Add log file: ${fileName}`,
            tree: treeData.sha,
            parents: [latestCommitSha],
        });

        await octokit.git.updateRef({
            owner: repoOwner,
            repo: repoName,
            ref: `heads/${branch}`,
            sha: newCommit.sha,
        });

        vscode.window.showInformationMessage(`Log file pushed successfully: ${fileName}`);
        console.log(`Log file committed: ${fileName}`);
    } catch (error: any) {
        console.error("Error while pushing log to GitHub:", error.message);
        vscode.window.showErrorMessage(`Error while pushing log: ${error.message}`);
    }
}
