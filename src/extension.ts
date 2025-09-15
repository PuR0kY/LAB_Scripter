import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { CustomTreeItem } from './CustomTreeItem';
import { CustomTreeDataProvider } from './CustomTreeDataProvider';

export function activate(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('lab');
    let source = config.get<string>('scriptsPath', path.join(process.env.APPDATA!, 'LAB', 'Scripts'));
    if (!source) {
        source = path.join(process.env.APPDATA!, 'LAB', 'Scripts');
    }

    // TreeView se skripty
    const treeDataProvider = new CustomTreeDataProvider(source);
    const treeView = vscode.window.createTreeView('lab', {
        treeDataProvider,
        showCollapseAll: true,
        canSelectMany: false
    });
    context.subscriptions.push(treeView);

    // Spuštění skriptu přes Task
    const runDisposable = vscode.commands.registerCommand('lab.runScript', async (item: CustomTreeItem) => {
        const scriptPath = path.join(source!, item.label);
        if (!fs.existsSync(scriptPath)) {
            vscode.window.showErrorMessage(`Script not found: ${scriptPath}`);
            return;
        }

        // Definice a spuštění shell tasku
        const task = new vscode.Task(
            { type: 'shell', task: 'Run LAB Script' },   // TaskDefinition
            vscode.TaskScope.Workspace,
            item.label,                                 // Label v seznamu běžících tasků
            'LAB',                                      // Source (skupina)
            new vscode.ShellExecution(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`)
        );

        vscode.tasks.executeTask(task);
    });

    // Otevření skriptu k editaci
    const editDisposable = vscode.commands.registerCommand('lab.editScript', (item: CustomTreeItem) => {
        const scriptPath = path.join(source!, item.label);
        vscode.workspace.openTextDocument(scriptPath).then(document => {
            vscode.window.showTextDocument(document);
        });
    });

    // Kliknutí na položku v TreeView spustí skript
    treeView.onDidChangeSelection(event => {
        const selectedItem = event.selection[0];
        if (selectedItem) {
            treeDataProvider.refresh();
            // vscode.commands.executeCommand('lab.runScript', selectedItem);
        }
    });

    context.subscriptions.push(runDisposable, editDisposable);
}

export function deactivate() {}

