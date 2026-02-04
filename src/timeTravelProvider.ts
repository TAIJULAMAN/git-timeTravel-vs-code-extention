import * as vscode from 'vscode';

export class TimeTravelProvider implements vscode.TextDocumentContentProvider {
    // EventEmitter to signal that the document content has changed
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    readonly onDidChange = this._onDidChange.event;

    // Internal cache to store content per URI
    // In a real app, you might want a more robust cache or map
    private contentMap: Map<string, string> = new Map();

    /**
     * Provide the content for the virtual document.
     */
    provideTextDocumentContent(uri: vscode.Uri): string {
        return this.contentMap.get(uri.toString()) || "Select a point in time to view history.";
    }

    /**
     * Update the content for a specific URI and trigger a refresh.
     */
    update(uri: vscode.Uri, content: string) {
        this.contentMap.set(uri.toString(), content);
        this._onDidChange.fire(uri);
    }
}
