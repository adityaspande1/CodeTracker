import * as vscode from 'vscode';
import { WorkSpaceTracker } from './workSpaceTracker';

export function initializeWorkSpaceTracking(outputChannel: vscode.OutputChannel): void {
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
