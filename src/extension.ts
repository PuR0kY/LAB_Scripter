import * as vscode from 'vscode';
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
    const treeView = vscode.window.createTreeView('lab', { treeDataProvider, showCollapseAll: true });
    context.subscriptions.push(treeView);

    let lastSelectedTreeItem: CustomTreeItem | undefined;

    // Command to run the PowerShell script
    let runDisposable = vscode.commands.registerCommand('lab.runScript', async (item: CustomTreeItem) => {
        const scriptPath = path.join(source, item.label);

        exec(`powershell.exe -executionpolicy bypass -file "${scriptPath}"`, (error, stdout, stderr) => {
            if (error) {
                lab.appendLine(`Error executing script: ${error.message}`);
                return;
            }
            if (stderr) {
                lab.appendLine(`Powershell Errors: ${stderr}`);
                return;
            }
            lab.appendLine(`Powershell Data: ${stdout}`);
            vscode.window.showInformationMessage("Powershell Script finished successfully");

            // If the same item is clicked again, deselect it
            if (item === lastSelectedTreeItem) {
                lastSelectedTreeItem = undefined;
                treeDataProvider.refresh();
            }
        });

        // Update the last selected item
        lastSelectedTreeItem = item;
    });

    // Command to open the PowerShell script for editing
    let editDisposable = vscode.commands.registerCommand('lab.editScript', (item: CustomTreeItem) => {
        const scriptPath = path.join(source, item.label);

        vscode.workspace.openTextDocument(scriptPath).then(document => {
            vscode.window.showTextDocument(document);
        });
    });

    treeView.onDidChangeSelection(event => {
        const selectedItem = event.selection[0];
        if (selectedItem) {
            // If the same item is clicked again, deselect it
            if (selectedItem === lastSelectedTreeItem) {
                lastSelectedTreeItem = undefined;
                treeDataProvider.refresh();
            } else {
                vscode.commands.executeCommand('lab.runScript', selectedItem);
            }
        }
    });

    context.subscriptions.push(runDisposable);
    context.subscriptions.push(editDisposable);
}

class CustomTreeDataProvider implements vscode.TreeDataProvider<CustomTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<CustomTreeItem | undefined | null | void> = new vscode.EventEmitter<CustomTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<CustomTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh() {
        this._onDidChangeTreeData.fire();
    }
    folderPath: string;
    constructor(folderPath: string) {
        this.folderPath = folderPath;
    }

    getTreeItem(element: CustomTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: CustomTreeItem): Thenable<CustomTreeItem[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            return Promise.resolve(this.getFilesInFolder(this.folderPath));
        }
    }

    getFilesInFolder(folderPath: string): CustomTreeItem[] {
        try {
            const files = fs.readdirSync(folderPath);
            return files.map(file => new CustomTreeItem(file, vscode.TreeItemCollapsibleState.None));
        } catch (error) {
            console.error('Error reading folder:', error);
            return [];
        }
    }
}

class CustomTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.contextValue = 'scriptItem';
        this.iconPath = new vscode.ThemeIcon('console');
    }
}

export function deactivate() { }
