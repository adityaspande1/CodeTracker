import { Octokit } from "@octokit/rest";
import * as vscode from "vscode";

export async function pushLogToGitHub(logContent: string, accessToken: string, session: vscode.AuthenticationSession) {
    const date = new Date();
    const workspaceName = vscode.workspace.name || "unknown_workspace";
    const sanitizedWorkspaceName = workspaceName.replace(/\s+/g, "_");

    const folderPath = `logs/${sanitizedWorkspaceName}`; // Workspace-specific folder
    const fileName = `log_${date.toISOString().split('T')[0]}.txt`; 
    const filePath = `${folderPath}/${fileName}`; // Path inside workspace folder
    const repoOwner = session.account.label;
    const repoName = "code-tracker";
    const branch = "main";

    const octokit = new Octokit({ auth: accessToken });

    try {
        // Ensure repository exists
        try {
            console.log("Checking if repository exists...");
            await octokit.rest.repos.get({ owner: repoOwner, repo: repoName });
            console.log(`Repository "${repoName}" exists.`);
        } catch (error: any) {
            if (error.status === 404) {
                console.log(`Repository "${repoName}" not found. Creating repository...`);
                await octokit.rest.repos.createForAuthenticatedUser({
                    name: repoName,
                    private: false,
                    description: "Repository for tracking logs",
                    auto_init: true,
                });
                console.log(`Repository "${repoName}" created.`);
            } else {
                throw error;
            }
        }

        // Fetch the existing log file content if it exists
        let existingContent = "";
        let fileSha: string | undefined = undefined;
        try {
            const { data } = await octokit.rest.repos.getContent({
                owner: repoOwner,
                repo: repoName,
                path: filePath,
                ref: branch,
            });

            if ("content" in data) {
                existingContent = Buffer.from(data.content, "base64").toString("utf-8");
                fileSha = data.sha;
            }
        } catch (error: any) {
            if (error.status !== 404) {
                throw error;
            }
        }

        // Append new content
        const updatedContent = existingContent + `\n${logContent}`;

        // Encode content in base64
        const encodedContent = Buffer.from(updatedContent, "utf-8").toString("base64");

        // Commit the updated content
        await octokit.rest.repos.createOrUpdateFileContents({
            owner: repoOwner,
            repo: repoName,
            path: filePath,
            message: `Update log file: ${fileName} in ${sanitizedWorkspaceName}`,
            content: encodedContent,
            sha: fileSha, // Required for updating an existing file
            branch: branch,
        });

        vscode.window.showInformationMessage(`Log file updated successfully: ${fileName} in ${sanitizedWorkspaceName}`);
        console.log(`Log file updated: ${fileName} in ${sanitizedWorkspaceName}`);
    } catch (error: any) {
        console.error("Error while updating log file on GitHub:", error.message);
        vscode.window.showErrorMessage(`Error while updating log file: ${error.message}`);
    }
}
