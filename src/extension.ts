import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getEnvironmentVariable } from './commands/get-environment-variable/get-environment-variable';

export async function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerTextEditorCommand('get-environment-variable', getEnvironmentVariable())
    );
}

export function deactivate() {}

// import * as vscode from 'vscode';
// import * as fs from 'fs';
// import * as path from 'path';
// import { getEnvironmentVariable } from './commands/get-environment-variable/get-environment-variable';

// export async function activate(context: vscode.ExtensionContext) {
//     let installDefender = vscode.commands.registerCommand('install-defender', async () => {
//         const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
//         statusBar.show();

//         try {
//             const fetch = (await import('node-fetch')).default;
//             const unzipper = (await import('unzipper')).default;

//             const config = vscode.workspace.getConfiguration('serverlessPrismaCloud');

//             const identity = config.get('identity') as string;
//             const secret = config.get('secret') as string;
//             const consolePath = config.get('console') as string;

//             if (!identity || !secret || !consolePath) {
//                 const openSettings = await vscode.window.showWarningMessage('Prisma Cloud Serverless settings are not configured. Please configure them in the settings.', 'Open Settings');
//                 if (openSettings === 'Open Settings') {
//                     await vscode.commands.executeCommand('workbench.action.openSettings', 'serverlessPrismaCloud');
//                 }
//                 return;
//             }

//             const functionName = await vscode.window.showInputBox({ 
//                 prompt: 'Enter function name:', 
//                 placeHolder: 'myFunction123', 
//                 ignoreFocusOut: true, 
//                 title: 'Step 1 of 2' 
//             });

//             if (!functionName) {
//                 return;
//             }

//             const workspaceFolders = vscode.workspace.workspaceFolders;

//             if (!workspaceFolders || workspaceFolders.length === 0) {
//                 vscode.window.showErrorMessage('Error: No workspace folder is open.');
//                 return;
//             }

//             const workspaceRoot = workspaceFolders[0].uri.fsPath;
//             const csprojFiles = fs.readdirSync(workspaceRoot).filter(file => file.endsWith('.csproj'));

//             if (csprojFiles.length === 0) {
//                 vscode.window.showErrorMessage('No .csproj file found in the project directory.');
//                 return;
//             }
            
//             const quickPickItems = csprojFiles.map(file => ({
//                 label: `$(file-code) ${file}`,
//                 description: ''
//             }));

//             const selectedCsprojFile = await vscode.window.showQuickPick(quickPickItems, { placeHolder: 'Select the .csproj file to modify', ignoreFocusOut: true, title: 'Step 2 of 2' });
//             if (!selectedCsprojFile) {
//                 vscode.window.showInformationMessage('No .csproj file selected.');
//                 return;
//             }

//             const csprojPath = path.join(workspaceRoot, selectedCsprojFile.label.replace('$(file-code) ', ''));

//             const authEndpoint = `${consolePath}/api/v32.06/authenticate`;
//             const bundleEndpoint = `${consolePath}/api/v1/defenders/serverless/bundle`;
//             const variableEndpoint = `${consolePath}/api/v1/policies/runtime/serverless/encode`;

//             const consoleUrl = new URL(consolePath).hostname;

//             const headers = { 'Content-Type': 'application/json; charset=UTF-8' };

//             const payload = {
//                 username: identity,
//                 password: secret
//             };

//             const functionInfo = {
//                 consoleAddr: consoleUrl,
//                 function: functionName,
//                 provider: 'azure'
//             };

//             try {
//                 const response = await fetch(authEndpoint, {
//                     method: 'POST',
//                     headers: headers,
//                     body: JSON.stringify(payload)
//                 });

//                 if (!response.ok) {
//                     vscode.window.showErrorMessage('Error: Failed to authenticate with Prisma Cloud.');
//                     return;
//                 }

//                 const data = await response.json() as { token: string };
//                 const token = data.token;

//                 const bundleResponse = await fetch(bundleEndpoint, {
//                     method: 'POST',
//                     headers: { ...headers, authorization: `Bearer ${token}`, 'Content-Type': 'application/octet-stream' },
//                     body: JSON.stringify({ runtime: 'dotnet', provider: 'azure' })
//                 });

//                 const arrayBuffer = await bundleResponse.arrayBuffer();
//                 const buffer = Buffer.from(arrayBuffer);
//                 const zipPath = path.join(context.extensionPath, 'twistlock_serverless_defender.zip');
//                 fs.writeFileSync(zipPath, buffer);

//                 if (!fs.existsSync(zipPath) || fs.statSync(zipPath).size === 0) {
//                     vscode.window.showErrorMessage('Error: Failed to download defender bundle. ZIP file is empty.');
//                     return;
//                 } else {
//                     statusBar.text = 'Defender bundle downloaded successfully.';
//                 }

//                 const extractPath = path.join(context.extensionPath, 'twistlock_temp');
//                 await fs.createReadStream(zipPath).pipe(unzipper.Extract({ path: extractPath })).promise();

//                 if (fs.existsSync(extractPath)) {
//                     const files = fs.readdirSync(extractPath);
//                     if (files.length === 0) {
//                         vscode.window.showErrorMessage('Error: Extraction failed. No files found.');
//                         return;
//                     } else {
//                         statusBar.text = `Extraction successful. Files extracted: ${files.join(', ')}`;
//                     }
//                 } else {
//                     vscode.window.showErrorMessage('Error: Extraction failed. Directory does not exist.');
//                     return;
//                 }

//                 const workspaceFolders = vscode.workspace.workspaceFolders;
//                 if (!workspaceFolders || workspaceFolders.length === 0) {
//                     vscode.window.showErrorMessage('Error: No workspace folder is open.');
//                     return;
//                 }

//                 const workspaceRoot = workspaceFolders[0].uri.fsPath;
//                 const targetPath = path.join(workspaceRoot, 'twistlock');

//                 if (fs.existsSync(targetPath)) {
//                     fs.rmdirSync(targetPath, { recursive: true });
//                 }
//                 fs.renameSync(path.join(extractPath, 'twistlock'), targetPath);

//                 fs.rmdirSync(extractPath, { recursive: true });

//                 const nupkgFiles = fs.readdirSync(targetPath).filter(file => file.endsWith('.nupkg'));
//                 if (nupkgFiles.length === 0) {
//                     vscode.window.showErrorMessage('Error: No .nupkg file found in the twistlock folder.');
//                     return;
//                 }
//                 const nupkgFile = nupkgFiles[0];
//                 const twistlockVersion = nupkgFile.split('.').slice(-4, -1).join('.');

//                 const variableResponse = await fetch(variableEndpoint, {
//                     method: 'POST',
//                     headers: { ...headers, authorization: `Bearer ${token}` },
//                     body: JSON.stringify(functionInfo)
//                 });

//                 const variableData = await variableResponse.json() as { data: string };
//                 const variableValue = variableData.data;

//                 if (!variableValue) {
//                     vscode.window.showErrorMessage('Error: Failed to retrieve variable value.');
//                     return;
//                 }

//                 await vscode.env.clipboard.writeText(variableValue);
//                 // Store the TW_POLICY value in the extension context
//                 context.workspaceState.update('TW_POLICY', variableValue);
//                 vscode.window.showInformationMessage('TW_POLICY variable value is copied to the clipboard.');

//                 const csprojFiles = fs.readdirSync(workspaceRoot).filter(file => file.endsWith('.csproj'));

//                 if (csprojFiles.length === 0) {
//                     vscode.window.showErrorMessage('No .csproj file found in the project directory.');
//                     return;
//                 }         

//                 let csprojContent = fs.readFileSync(csprojPath, 'utf8');
//                 const insertIndex = csprojContent.lastIndexOf('</Project>');
//                 const newContent = `
// <ItemGroup>
//     <PackageReference Include="Twistlock" Version="${twistlockVersion}" />
//     <TwistlockFiles Include="twistlock\\*" Exclude="twistlock\\twistlock.${twistlockVersion}.nupkg" />
// </ItemGroup>
// <ItemGroup>
//     <None Include="@(TwistlockFiles)" CopyToOutputDirectory="Always" LinkBase="twistlock\\" />
// </ItemGroup>

// `;
//                 csprojContent = csprojContent.slice(0, insertIndex) + newContent + csprojContent.slice(insertIndex);
//                 fs.writeFileSync(csprojPath, csprojContent, 'utf8');
//                 vscode.window.showInformationMessage(`Prisma Cloud Serverless Defender added to ${selectedCsprojFile}`);

//                 const nugetConfigPath = path.join(workspaceRoot, 'NuGet.Config');
//                 const nugetConfigContent = 
// `<?xml version="1.0" encoding="utf-8"?>
// <configuration>
//     <packageSources>
//         <clear />
//         <add key="local-packages" value="./twistlock/" />
//         <add key="nuget.org" value="https://api.nuget.org/v3/index.json" protocolVersion="3" />
//     </packageSources>
// </configuration>`;

//                 if (!fs.existsSync(nugetConfigPath)) {
//                     fs.writeFileSync(nugetConfigPath, nugetConfigContent, 'utf8');
//                     statusBar.text = 'NuGet.Config created successfully.';
//                 } else {
//                     let existingNugetConfig = fs.readFileSync(nugetConfigPath, 'utf8');
//                     if (!existingNugetConfig.includes('<add key="local-packages" value="./twistlock/" />')) {
//                         existingNugetConfig = existingNugetConfig.replace('<packageSources>', `<packageSources>
//                             <add key="local-packages" value="./twistlock/" />`);
//                         fs.writeFileSync(nugetConfigPath, existingNugetConfig, 'utf8');
//                         statusBar.text = 'NuGet.Config updated successfully.';
//                     } else {
//                         statusBar.text = 'NuGet.Config already contains the local-packages source.';
//                     }
//                 }

//             } catch (error: unknown) {
//                 if (error instanceof Error) {
//                     vscode.window.showErrorMessage(`Error: ${error.message}`);
//                 } else {
//                     vscode.window.showErrorMessage(`Error: ${JSON.stringify(error)}`);
//                 }
//             }
//         } catch (error) {
//             if (error instanceof Error) {
//                 vscode.window.showErrorMessage(`Error: ${error.message}`);
//             } else {
//                 vscode.window.showErrorMessage(`Error: ${JSON.stringify(error)}`);
//             }
//         } finally {
//             statusBar.dispose();
//         }
//     });

//     context.subscriptions.push(
//         vscode.commands.registerCommand('extension.twPolicyValue', async () => {
//             const twPolicy = context.workspaceState.get('TW_POLICY');
//             if (twPolicy) {
//                 await vscode.env.clipboard.writeText(twPolicy as string);
//                 vscode.window.showInformationMessage('TW_POLICY variable value copied to clipboard.');
//             } else {
//                 vscode.window.showErrorMessage('TW_POLICY value not found.');
//             }
//         })
//     );

//     context.subscriptions.push(installDefender);
// }

// export function deactivate() {}