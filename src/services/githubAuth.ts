import { AuthenticationSession,authentication,window } from "vscode";


export async function githubAuthenticate():Promise<AuthenticationSession|undefined>{
    const session = await authentication.getSession('github', ['repo'],{createIfNone:true});
    if(!session){
      window.showErrorMessage("Github authentication failed");
       return;
    }
    window.showInformationMessage("Github authenticated successfully with  "+session.account.label);
    console.log("session",session);

return session;
}