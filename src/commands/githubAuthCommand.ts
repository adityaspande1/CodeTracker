import * as vscode from 'vscode';
import { githubAuthenticate } from '../services/githubAuth';

export function registerGitHubAuthCommand(context: vscode.ExtensionContext): void {
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
                vscode.window.showInformationMessage('GitHub Authentication Successful !');
            } catch (error: any) {
                vscode.window.showErrorMessage(`GitHub Authentication failed: ${error.message}`);
            }
        } else {
            vscode.window.showInformationMessage('Authentication canceled.');
        }
    });

    context.subscriptions.push(disposable);
}
