import * as vscode from 'vscode';
import { registerGitHubAuthCommand } from './commands/githubAuthCommand';
import { initializeWorkSpaceTracking } from './services/workSpaceTrackerService';
import {pushLogToGitHub} from './services/pushLog';
import { WorkSpaceTracker } from './services/workSpaceTracker';
import { authentication, AuthenticationSession } from 'vscode'; // For GitHub Authentication

export function activate(context: vscode.ExtensionContext) {
    const outputChannel = vscode.window.createOutputChannel('CodeTracker');
    console.log('CodeTracker extension is now active!');

    // Create a single instance of WorkSpaceTracker


    // GitHub Authentication
    registerGitHubAuthCommand(context);

    // Workspace tracking initialization
    initializeWorkSpaceTracking(outputChannel);

    // Register the push log command
    let disposable = vscode.commands.registerCommand('codetracker.pushLogToGitHub', async () => {
        const session: AuthenticationSession | undefined = await authentication.getSession('github', ['repo'], { createIfNone: true });
        if (!session) {
            vscode.window.showErrorMessage('GitHub authentication failed');
            return;
        }

        // Get the tracked changes as a string
       const logContent=WorkSpaceTracker.getInstance(outputChannel).getTrackedChangesAsString();
       

        // Get the access token from the session
        const accessToken = session.accessToken;

        // Push the log to GitHub
        try {
            await pushLogToGitHub(logContent, accessToken, session);
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to push log: ${error.message}`);
        }
    });

    context.subscriptions.push(disposable);

    // Dispose the tracker when the extension is deactivated
    // context.subscriptions.push({ dispose: () => workspaceTracker.dispose() });
}




export function deactivate(): void {
    console.log('CodeTracker extension has been deactivated.');
}
