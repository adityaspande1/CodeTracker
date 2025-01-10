import * as vscode from 'vscode';
import { registerGitHubAuthCommand } from './commands/githubAuthCommand';
import { initializeWorkSpaceTracking } from './services/workSpaceTrackerService';
import {pushLogToGitHub} from './services/pushLog';
import { WorkSpaceTracker } from './services/workSpaceTracker';
import { authentication, AuthenticationSession } from 'vscode'; 
import { registerCodeTrackerWebViewProvider } from './views/sideBar';
import { githubAuthenticate } from './services/githubAuth';
export function activate(context: vscode.ExtensionContext) {
    const outputChannel = vscode.window.createOutputChannel('CodeTracker');
    console.log('CodeTracker extension is now active!');

    const webViewProvider = registerCodeTrackerWebViewProvider(context, outputChannel);
    


   const disposable1 = vscode.commands.registerCommand('codetracker.authenticate', async () => {
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
                   initializeWorkSpaceTracking(outputChannel);
               } catch (error: any) {
                   vscode.window.showErrorMessage(`GitHub Authentication failed: ${error.message}`);
               }
           } else {
               vscode.window.showInformationMessage('Authentication canceled.');
           }
       });
   
       context.subscriptions.push(disposable1);

  
    let disposable = vscode.commands.registerCommand('codetracker.pushLogToGitHub', async () => {
        const session: AuthenticationSession | undefined = await authentication.getSession('github', ['repo'], { createIfNone: true });
        if (!session) {
            vscode.window.showErrorMessage('GitHub authentication failed');
            return;
        }

      
       const logContent=WorkSpaceTracker.getInstance(outputChannel).getTrackedChangesAsString();
       
        const accessToken = session.accessToken;
        try {
            await pushLogToGitHub(logContent, accessToken, session);
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to push log: ${error.message}`);
        }
    });


    context.subscriptions.push(disposable);

}

export function deactivate(): void {
    console.log('CodeTracker extension has been deactivated.');
}
