import * as vscode from 'vscode';
import { registerGitHubAuthCommand } from './commands/githubAuthCommand';
import { initializeWorkSpaceTracking } from './services/workSpaceTrackerService';
import {pushLogToGitHub} from './services/pushLog'
import { authentication, AuthenticationSession } from 'vscode'; // For GitHub Authentication

export function activate(context: vscode.ExtensionContext) {
    const outputChannel = vscode.window.createOutputChannel('CodeTracker');
    console.log('CodeTracker extension is now active!');

    // Register GitHub Authentication command
    registerGitHubAuthCommand(context);

    // Initialize and track workspace changes
    initializeWorkSpaceTracking(outputChannel);

    // Register the command to push logs to GitHub
    let disposable = vscode.commands.registerCommand('codetracker.pushLogToGitHub', async () => {
        // Authenticate with GitHub
        const session: AuthenticationSession | undefined = await authentication.getSession('github', ['repo'], { createIfNone: true });
        if (!session) {
            vscode.window.showErrorMessage('GitHub authentication failed');
            return;
        }

        // Get log content (you can modify this to get actual log content)
        const logContent = "This is a sample log content."; // Example, replace it with actual logs if needed

        // Get the access token from the session
        const accessToken = session.accessToken;

        // Push the log to GitHub
        try {
            await pushLogToGitHub(logContent, accessToken, session);
        } catch (error:any) {
            vscode.window.showErrorMessage(`Failed to push log: ${error.message}`);
        }
    });

    // Add to subscriptions to ensure cleanup on deactivate
    context.subscriptions.push(disposable);
}

export function deactivate(): void {
    console.log('CodeTracker extension has been deactivated.');
}
