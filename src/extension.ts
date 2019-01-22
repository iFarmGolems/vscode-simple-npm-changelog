// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import get from 'axios';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    'extension.showChangelog',
    async () => {
      if (vscode.workspace.workspaceFolders) {
        const packageJson = await vscode.workspace.openTextDocument(
          vscode.workspace.workspaceFolders[0].uri.path + '/package.json'
        );

        const parsed = JSON.parse(packageJson.getText());

        const allPackages = Object.keys({
          ...parsed.dependencies,
          ...parsed.devDependencies
        });

        const chosenPackage = await vscode.window.showQuickPick(allPackages);

        const npmResponse = await get(
          `https://registry.npmjs.org/${chosenPackage}`
        );

        const repositoryAddress = (npmResponse.data.repository
          .url as string).match(/https?.+?(?=\.git)/);

        if (repositoryAddress) {
          let rightOption;

          const repoAddress = repositoryAddress[0];
          const repoFilePrefix = '/blob/master/';

          try {
            const fileName = 'CHANGELOG.md';
            await get(repoAddress + repoFilePrefix + fileName);
            rightOption = fileName;
          } catch (error) {
            try {
              const fileName = 'CHANGELOG';
              await get(repoAddress + repoFilePrefix + fileName);
              rightOption = fileName;
            } catch (error) {
              try {
                const fileName = 'CHANGELOG.txt';
                await get(repoAddress + repoFilePrefix + fileName);
                rightOption = fileName;
              } catch (error) {}
            }
          }

          if (rightOption) {
            vscode.commands.executeCommand(
              'vscode.open',
              vscode.Uri.parse(repoAddress + repoFilePrefix + rightOption)
            );
          } else {
            vscode.window.showErrorMessage(
              'Could not find changelog for package ' + chosenPackage
            );
          }
        }
      } else {
        vscode.window.showErrorMessage('No project opened!');
      }
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
