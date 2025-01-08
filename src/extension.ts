
import * as vscode from 'vscode';
import { githubAuthenticate } from './services/githubAuth';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "codetracker" is now active!');

	
	const disposable = vscode.commands.registerCommand('codetracker.helloWorld', () => {
	
		vscode.window.showInformationMessage('Hello World from codetracker!');
	});

	context.subscriptions.push(
		vscode.commands.registerCommand('codetracker.authenticate', async () => {
			const response = await vscode.window.showInformationMessage(
				'Allow CodeTracker to Authenticate with GitHub',
				"Yes",
				"No"
			);
	
			if (response === "Yes") {
				try {
					const session= await githubAuthenticate();
					console.log("session",session);
				} catch (error: any) {
					vscode.window.showErrorMessage('GitHub Authentication failed: ' + error.message);
				}
			} else {
				vscode.window.showInformationMessage('Authentication canceled.');
			}
		})
	);
	

	context.subscriptions.push(disposable);
}


export function deactivate() {}
