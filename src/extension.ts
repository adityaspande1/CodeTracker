import * as vscode from 'vscode';
import { githubAuthenticate } from './services/githubAuth';
import { WorkSpaceTracker } from './services/workSpaceTracker';

export function activate(context: vscode.ExtensionContext) {
    const outputChannel = vscode.window.createOutputChannel('CodeTracker');
    console.log('CodeTracker extension is now active!');

    // Register "Hello World" command
    registerHelloWorldCommand(context);

    // Register GitHub Authentication command
    registerGitHubAuthCommand(context);

    // Initialize and track workspace changes
    initializeWorkSpaceTracking(outputChannel);
}

function registerHelloWorldCommand(context: vscode.ExtensionContext): void {
    const disposable = vscode.commands.registerCommand('codetracker.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from CodeTracker!');
    });

    context.subscriptions.push(disposable);
}

function registerGitHubAuthCommand(context: vscode.ExtensionContext): void {
    const disposable = vscode.commands.registerCommand('codetracker.authenticate', async () => {
        const userResponse = await vscode.window.showInformationMessage(
            'Allow CodeTracker to Authenticate with GitHub',
            'Yes',
            'No'
        );

        if (userResponse === 'Yes') {
            try {
                const session = await githubAuthenticate();
                console.log('GitHub Session:', session);
                vscode.window.showInformationMessage('GitHub Authentication Successful!');
            } catch (error: any) {
                vscode.window.showErrorMessage(`GitHub Authentication failed: ${error.message}`);
            }
        } else {
            vscode.window.showInformationMessage('Authentication canceled.');
        }
    });

    context.subscriptions.push(disposable);
}

function initializeWorkSpaceTracking(outputChannel: vscode.OutputChannel): void {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showInformationMessage('No workspace folders found.');
        return;
    }

    const workspaceTracker = new WorkSpaceTracker(outputChannel);
    workspaceTracker.getTrackedChanges();

    vscode.window.showInformationMessage(
        `Workspace folders initialized. Tracking changes for: ${workspaceFolders
            .map(folder => folder.uri.fsPath)
            .join(', ')}`
    );
}

export function deactivate(): void {
    console.log('CodeTracker extension has been deactivated.');
}
