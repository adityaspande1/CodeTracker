import {
    CancellationToken,
    commands,
    ExtensionContext,
    Uri,
    Webview,
    WebviewView,
    OutputChannel,
    WebviewViewProvider,
    WebviewViewResolveContext,
    window,
    AuthenticationSession,
    authentication,
  
} from "vscode";
import { githubAuthenticate } from "../services/githubAuth";
import { initializeWorkSpaceTracking } from "../services/workSpaceTrackerService";

export function registerCodeTrackerWebViewProvider(
    context: ExtensionContext,
    outputChannel: OutputChannel
): CodeTrackerWebViewProvider {
    const provider = new CodeTrackerWebViewProvider(context.extensionUri, outputChannel);
    context.subscriptions.push(
        window.registerWebviewViewProvider("sidebarPanel", provider)
    );
    return provider;
}

export class CodeTrackerWebViewProvider implements WebviewViewProvider {
    private _view?: WebviewView;

    constructor(private readonly _extensionUri: Uri, private outputChannel: OutputChannel) {}

    resolveWebviewView(
        webviewView: WebviewView,
        _context: WebviewViewResolveContext,
        _token: CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                Uri.joinPath(this._extensionUri, "media")
            ],
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.type) {
                case "startTracking": {
                     
                        await commands.executeCommand("codetracker.authenticate");
                        await commands.executeCommand("codetracker.trackWorkspace");
                        

                    
                    break;
                }
                case "pushLogs": {
                    const session = await githubAuthenticate();
                    if (session) {
                        window.showInformationMessage("Pushing Logs to GitHub!");
                        await commands.executeCommand("codetracker.pushLogToGitHub");
                    }
                    break;
                }
            }
        });
    }


    private _getHtmlForWebview(webview: Webview): string {
        const styleResetUri = webview.asWebviewUri(
            Uri.joinPath(this._extensionUri, "media", "css", "reset.css")
        );
        const styleVSCodeUri = webview.asWebviewUri(
            Uri.joinPath(this._extensionUri, "media", "css", "vscode.css")
        );
        const scriptUri = webview.asWebviewUri(
            Uri.joinPath(this._extensionUri, "media", "js", "sidebar.js")
        );

        return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="Content-Security-Policy" content="
                default-src 'none';
                img-src ${webview.cspSource} https:;
                script-src 'unsafe-inline' ${webview.cspSource};
                style-src ${webview.cspSource} 'unsafe-inline';">
              <link href="${styleResetUri}" rel="stylesheet">
              <link href="${styleVSCodeUri}" rel="stylesheet">
           </head>
           <body>
              <div>Action buttons:</div>
              <button type="button" class="start-btn" onclick="startTracking()">Start Tracking</button>
              <button type="button" class="push-btn" onclick="pushLogs()">Push Logs</button>
              <div id="tree-container"></div>
              <script>
                const vscode = acquireVsCodeApi();
                function startTracking() {
                    vscode.postMessage({ type: 'startTracking' });
                }
                function pushLogs() {
                    vscode.postMessage({ type: 'pushLogs' });
                }
              </script>
           </body>
        </html>`;
    }
}
