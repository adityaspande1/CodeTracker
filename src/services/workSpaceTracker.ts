import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import * as path from 'path';

export interface FileChange {
  uri: vscode.Uri;
  type: 'created' | 'deleted' | 'modified';
  time: Date;
}

export class WorkSpaceTracker extends EventEmitter {
  private watcher: vscode.FileSystemWatcher | null = null;
  private ignorePatterns: string[] = [];
  private workSpaceChanges: Map<string, FileChange> = new Map();
  private logChannel: vscode.OutputChannel;

  constructor(logChannel: vscode.OutputChannel) {
    super();
    this.logChannel = logChannel;
    this.setupWatcher();
  }

  private setupWatcher(): void {
    this.logChannel.appendLine('FileTracker: Initializing file watcher...');
    console.log('FileTracker: Initializing file watcher...');

    this.ignorePatterns = vscode.workspace
      .getConfiguration('filetracker')
      .get<string[]>('ignore') || [];

    this.watcher = vscode.workspace.createFileSystemWatcher(
      '**/*',
      false, // This will include Creation
      false, // This includes Change
      false // Include deletion
    );

    this.watcher.onDidCreate((uri) => this.trackChange(uri, 'created'));
    this.watcher.onDidChange((uri) => this.trackChange(uri, 'modified'));
    this.watcher.onDidDelete((uri) => this.trackChange(uri, 'deleted'));

    this.logChannel.appendLine('FileTracker: File watcher initialized.');
    console.log('FileTracker: File watcher initialized.');
  }

  private trackChange(uri: vscode.Uri, type: 'created' | 'modified' | 'deleted'): void {
    const relativePath = vscode.workspace.asRelativePath(uri);

    // Check if file matches ignore patterns
    const isIgnored = this.ignorePatterns.some((pattern) =>
      new RegExp(pattern).test(relativePath)
    );

    if (isIgnored) {
      this.logChannel.appendLine(`FileTracker: Ignored file ${relativePath}.`);
      console.log(`FileTracker: Ignored file ${relativePath}.`);
      return;
    }

    const validExtensions = ['js', 'ts', 'html', 'css', 'json', 'md', 'java', 'py'];
    const extension = path.extname(uri.fsPath).substring(1);

    if (validExtensions.includes(extension)) {
      const change: FileChange = {
        uri,
        type,
        time: new Date(),
      };

      this.workSpaceChanges.set(uri.fsPath, change);
      this.emit('fileChange', change);

      this.logChannel.appendLine(
        `FileTracker: ${type.toUpperCase()} detected in ${relativePath}`
      );
      console.log(`FileTracker: ${type.toUpperCase()} detected in ${relativePath}`);
    }
  }

  public getTrackedChanges(): FileChange[] {
    return Array.from(this.workSpaceChanges.values());
  }

  public clearChanges(): void {
    this.workSpaceChanges.clear();
    this.logChannel.appendLine('FileTracker: Cleared all tracked changes.');
    console.log('FileTracker: Cleared all tracked changes.');
  }

  public updateIgnorePatterns(patterns: string[]): void {
    this.ignorePatterns = patterns;
    this.logChannel.appendLine(
      `FileTracker: Updated ignore patterns to: ${patterns.join(', ')}`
    );
    console.log(`FileTracker: Updated ignore patterns to: ${patterns.join(', ')}`);
  }

  public dispose(): void {
    this.watcher?.dispose();
    this.logChannel.appendLine('FileTracker: Disposed file watcher.');
    console.log('FileTracker: Disposed file watcher.');
  }
}
