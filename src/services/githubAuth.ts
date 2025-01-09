import { AuthenticationSession, authentication, window } from 'vscode';

export async function githubAuthenticate(): Promise<AuthenticationSession | { accessToken: string } | undefined> {
    const session = await authentication.getSession('github', ['repo'], { createIfNone: true });
    if (!session) {
        window.showErrorMessage('GitHub authentication failed');
        return;
    }
    window.showInformationMessage('GitHub authenticated successfully with ' + session.account.label);
    console.log('session', session);

    return session;
}
