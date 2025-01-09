import axios from 'axios';
import * as vscode from 'vscode';

export async function pushLogToGitHub(logContent: string, accessToken: string, session: vscode.AuthenticationSession) {
    const date = new Date();
    const fileName = `log${date.toISOString().split('T')[0]}.txt`; // Format: logYYYY-MM-DD.txt
    const repoOwner = session.account.label;  // Replace with your GitHub username
    const repoName = 'code-tracker';   // Your GitHub repo name
    const branch = 'main'; // You can modify this if you want to commit to a different branch

    // GitHub API endpoint for creating or updating a file
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/logs/${fileName}`;
    console.log('API URL:', apiUrl);

    try {
        // Step 1: Check if the file already exists (by trying to fetch the file)
        const fileResponse = await axios.get(apiUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const sha = fileResponse.data.sha; // Get the SHA if the file exists

        // Step 2: Create the Git Tree for the commit
        const treeApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/trees`;
        const treeResponse = await axios.post(
            treeApiUrl,
            {
                tree: [
                    {
                        path: `logs/${fileName}`,
                        mode: '100644', // file mode (regular file)
                        content: logContent, // file content
                    }
                ],
                base_tree: sha, // if it's an existing commit, use its SHA for base_tree
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const treeSha = treeResponse.data.sha; // Get tree SHA for the new tree

        // Step 3: Create the Commit
        const commitApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/commits`;
        const commitResponse = await axios.post(
            commitApiUrl,
            {
                message: `Update log file ${fileName}`,
                tree: treeSha, // Use the created tree's SHA
                parents: [sha], // Parent commit(s) (i.e., the branch head you are committing to)
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const commitSha = commitResponse.data.sha; // Commit SHA

        // Step 4: Update the Branch Reference
        const refApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs/heads/${branch}`;
        await axios.patch(
            refApiUrl,
            {
                sha: commitSha, // Point the branch to the new commit
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        vscode.window.showInformationMessage(`Log file updated and committed: ${fileName}`);
    } catch (err: any) {
        if (err.response && err.response.status === 404) {
            const createResponse = await axios.put(
                apiUrl,
                {
                    message: `Create log file ${fileName}`,
                    content: Buffer.from(logContent).toString('base64'),
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            // Step 1: Create the Git Tree for the commit (if the file doesn't exist)
            const treeApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/trees`;
            const treeResponse = await axios.post(
                treeApiUrl,
                {
                    tree: [
                        {
                            path: `logs/${fileName}`,
                            mode: '100644', // file mode (regular file)
                            content: logContent, // file content
                        }
                    ]
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            const treeSha = treeResponse.data.sha;

            // Step 2: Create the Commit for the new file
            const commitApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/commits`;
            const commitResponse = await axios.post(
                commitApiUrl,
                {
                    message: `Create log file ${fileName}`,
                    tree: treeSha, // Use the created tree's SHA
                    parents: [],
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            const commitSha = commitResponse.data.sha;

            // Step 3: Update the Branch Reference
            const refApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs/heads/${branch}`;
            await axios.patch(
                refApiUrl,
                {
                    sha: commitSha,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            vscode.window.showInformationMessage(`Log file created and committed: ${fileName}`);
        } else {
            vscode.window.showErrorMessage(`Failed to push log: ${err.message}`);
        }
    }
}
