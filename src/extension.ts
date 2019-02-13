import * as vscode from 'vscode';
import get from 'axios';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    'extension.showChangelog',
    async () => {
      if (vscode.workspace.workspaceFolders) {
        const packageJson = await vscode.workspace.openTextDocument(
          vscode.workspace.workspaceFolders[0].uri.path + '/package.json'
        );

        const { dependencies, devDependencies } = JSON.parse(
          packageJson.getText()
        );

        const allPackages = Object.keys({
          ...dependencies,
          ...devDependencies
        });

        const chosenPackage = await vscode.window.showQuickPick(allPackages);

        const npmResponse = await get(
          `https://registry.npmjs.org/${chosenPackage}`
        );

        const repositoryAddress = (npmResponse.data.repository
          .url as string).match(/(github|gitlab).+?(?=\.git)/);

        if (repositoryAddress) {
          let rightOption;

          const repoAddress = 'https://' + repositoryAddress[0];
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

export function deactivate() {}
