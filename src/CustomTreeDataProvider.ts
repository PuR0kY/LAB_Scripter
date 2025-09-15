import * as fs from 'fs';
import * as vscode from 'vscode';
import { CustomTreeItem } from './CustomTreeItem';

export class CustomTreeDataProvider implements vscode.TreeDataProvider<CustomTreeItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<CustomTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(private folderPath: string) { }

    refresh() {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: CustomTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: CustomTreeItem): Thenable<CustomTreeItem[]> {
        if (element) return Promise.resolve([]);
        return Promise.resolve(this.getFilesInFolder(this.folderPath));
    }

    private getFilesInFolder(folderPath: string): CustomTreeItem[] {
        try {
            const files = fs.readdirSync(folderPath);
            return files.map(file => new CustomTreeItem(file, vscode.TreeItemCollapsibleState.None));
        } catch (error) {
            console.error('Error reading folder:', error);
            return [];
        }
    }
}
