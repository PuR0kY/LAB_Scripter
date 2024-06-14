import vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('lab');
    let source = config.get<string>('scriptsPath', path.join(process.env.APPDATA!, 'LAB', 'Scripts'));
    if (source === "") {
        source = path.join(process.env.APPDATA!, 'LAB', 'Scripts');
    }
    let lab = vscode.window.createOutputChannel("LAB");
    lab.appendLine(`Congratulations, your extension "lab" is now active! Scripts path: ${source}`);
    const treeDataProvider = new CustomTreeDataProvider(source);
    const treeView = vscode.window.createTreeView('lab', { treeDataProvider, showCollapseAll: true, canSelectMany: true });
    context.subscriptions.push(treeView);

    let runDisposable = vscode.commands.registerCommand('lab.runScript', async (item: CustomTreeItem) => {
        if (!item.isDirectory) {
            const scriptPath = item.resourceUri.fsPath;
            exec(`powershell.exe -executionpolicy bypass -file "${scriptPath}"`, (error, stdout, stderr) => {
                if (error) {
                    lab.appendLine(`Error executing script: ${error.message}`);
                    return;
                }
                if (stderr) {
                    lab.appendLine(`Powershell Errors: ${stderr}`);
                    return;
                }
                vscode.window.showInformationMessage("Powershell Script finished successfully");
            });
        }
    });

    let editDisposable = vscode.commands.registerCommand('lab.editScript', (item: CustomTreeItem) => {
        if (!item.isDirectory) {
            const scriptPath = item.resourceUri.fsPath;
            vscode.workspace.openTextDocument(scriptPath).then(document => {
                vscode.window.showTextDocument(document);
            });
        }
    });

    treeView.onDidChangeSelection(event => {
        const selectedItem = event.selection[0];
        if (selectedItem && !selectedItem.isDirectory) {
            vscode.commands.executeCommand('lab.runScript', selectedItem);
        }
    });

    function updateTreeView() {
        treeDataProvider.refresh();
    }

    const interval = setInterval(updateTreeView, 5000);
    context.subscriptions.push(vscode.Disposable.from(treeView, { dispose: () => clearInterval(interval!) }));

    context.subscriptions.push(runDisposable);
    context.subscriptions.push(editDisposable);
}

class CustomTreeDataProvider implements vscode.TreeDataProvider<CustomTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<CustomTreeItem | undefined | null | void> = new vscode.EventEmitter<CustomTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<CustomTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    folderPath: string;

    constructor(folderPath: string) {
        this.folderPath = folderPath;
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: CustomTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: CustomTreeItem): Thenable<CustomTreeItem[]> {
        if (element) {
            return Promise.resolve(this.getFilesInFolder(element.resourceUri.fsPath));
        } else {
            return Promise.resolve(this.getFilesInFolder(this.folderPath));
        }
    }

    private getFilesInFolder(folderPath: string): CustomTreeItem[] {
        try {
            const items = fs.readdirSync(folderPath);
            return items.map(item => {
                const itemPath = path.join(folderPath, item);
                const isDirectory = fs.lstatSync(itemPath).isDirectory();
                return new CustomTreeItem(
                    item,
                    isDirectory ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
                    vscode.Uri.file(itemPath),
                    isDirectory
                );
            });
        } catch (error) {
            console.error('Error reading folder:', error);
            return [];
        }
    }
}

class CustomTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly resourceUri: vscode.Uri,
        public readonly isDirectory: boolean = false
    ) {
        super(label, collapsibleState);
        this.contextValue = isDirectory ? 'folderItem' : 'scriptItem';
    }
}


export function deactivate() { }
