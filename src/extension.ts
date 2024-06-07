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
    console.log(`Congratulations, your extension "lab" is now active! Scripts path: ${source}`);

    const treeDataProvider = new CustomTreeDataProvider(source);
    const treeView = vscode.window.createTreeView('lab', { treeDataProvider, showCollapseAll: true });
    // Command to run the PowerShell script
    let runDisposable = vscode.commands.registerCommand('lab.runScript', (item: CustomTreeItem) => {
        const scriptPath = path.join(source, item.label);
        
        exec(`powershell.exe -executionpolicy bypass -file "${scriptPath}"`, (error, stdout, stderr) => {
			if (error) {
				vscode.window.showErrorMessage(`Error executing script: ${error.message}`);
				return;
			}
			if (stderr) {
				vscode.window.showErrorMessage(`Powershell Errors: ${stderr}`);
				return;
			}
			vscode.window.showInformationMessage(`Powershell Data: ${stdout}`);
			vscode.window.showInformationMessage("Powershell Script finished successfully");
		});
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
            vscode.commands.executeCommand('lab.runScript', selectedItem);
        }
    });

    treeView.onDidExpandElement(event => {
        const selectedItem = event.element;
        if (selectedItem instanceof CustomTreeItem) {
            vscode.commands.executeCommand('lab.editScript', selectedItem);
        }
    });

    context.subscriptions.push(runDisposable);
    context.subscriptions.push(editDisposable);
}

class CustomTreeDataProvider implements vscode.TreeDataProvider<CustomTreeItem> {
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
            return files.map(file => new CustomTreeItem(file));
        } catch (error) {
            console.error('Error reading folder:', error);
            return [];
        }
    }

    onDidChangeTreeData?: vscode.Event<void | CustomTreeItem | null | undefined> | undefined;
}

class CustomTreeItem extends vscode.TreeItem {
    constructor(public readonly label: string) {
        super(label, vscode.TreeItemCollapsibleState.None);
    }
}

export function deactivate() {}
