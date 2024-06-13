import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.installServerlessDefender', async () => {
        try {
            const fetch = (await import('node-fetch')).default;
            const unzipper = (await import('unzipper')).default;

            const functionName = await vscode.window.showInputBox({ prompt: 'Enter function name' });

            if (!functionName) {
                vscode.window.showErrorMessage('Error: Function name cannot be empty.');
                return;
            }

            const config = vscode.workspace.getConfiguration('prismaCloud');
            const identity = config.get('identity') as string;
            const secret = config.get('secret') as string;
            const consolePath = config.get('console') as string;

            if (!identity || !secret || !consolePath) {
                vscode.window.showErrorMessage('Error: Please configure Prisma Cloud settings in the settings.');
                return;
            }

            const authEndpoint = `${consolePath}/api/v32.06/authenticate`;
            const bundleEndpoint = `${consolePath}/api/v1/defenders/serverless/bundle`;
            const variableEndpoint = `${consolePath}/api/v1/policies/runtime/serverless/encode`;

            const consoleUrl = new URL(consolePath).hostname;

            const headers = { 'Content-Type': 'application/json; charset=UTF-8' };

            const payload = {
                username: identity,
                password: secret
            };

            const functionInfo = {
                consoleAddr: consoleUrl,
                function: functionName,
                provider: 'azure'
            };

            try {
                const response = await fetch(authEndpoint, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    vscode.window.showErrorMessage('Error: Failed to authenticate with Prisma Cloud.');
                    return;
                }

                const data = await response.json() as { token: string };
                const token = data.token;

                const bundleResponse = await fetch(bundleEndpoint, {
                    method: 'POST',
                    headers: { ...headers, authorization: `Bearer ${token}`, 'Content-Type': 'application/octet-stream' },
                    body: JSON.stringify({ runtime: 'dotnet', provider: 'azure' })
                });

                const arrayBuffer = await bundleResponse.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const zipPath = path.join(context.extensionPath, 'twistlock_serverless_defender.zip');
                fs.writeFileSync(zipPath, buffer);

                if (!fs.existsSync(zipPath) || fs.statSync(zipPath).size === 0) {
                    vscode.window.showErrorMessage('Error: Failed to download defender bundle. ZIP file is empty.');
                    return;
                } else {
                    vscode.window.showInformationMessage('Defender bundle downloaded successfully.');
                }

                const extractPath = path.join(context.extensionPath, 'twistlock_temp');
                await fs.createReadStream(zipPath).pipe(unzipper.Extract({ path: extractPath })).promise();

                if (fs.existsSync(extractPath)) {
                    const files = fs.readdirSync(extractPath);
                    if (files.length === 0) {
                        vscode.window.showErrorMessage('Error: Extraction failed. No files found.');
                        return;
                    } else {
                        vscode.window.showInformationMessage(`Extraction successful. Files extracted: ${files.join(', ')}`);
                    }
                } else {
                    vscode.window.showErrorMessage('Error: Extraction failed. Directory does not exist.');
                    return;
                }

                const workspaceFolders = vscode.workspace.workspaceFolders;
                if (!workspaceFolders || workspaceFolders.length === 0) {
                    vscode.window.showErrorMessage('Error: No workspace folder is open.');
                    return;
                }

                const workspaceRoot = workspaceFolders[0].uri.fsPath;
                const targetPath = path.join(workspaceRoot, 'twistlock');

                if (fs.existsSync(targetPath)) {
                    fs.rmdirSync(targetPath, { recursive: true });
                }
                fs.renameSync(path.join(extractPath, 'twistlock'), targetPath);

                fs.rmdirSync(extractPath, { recursive: true });

                const nupkgFiles = fs.readdirSync(targetPath).filter(file => file.endsWith('.nupkg'));
                if (nupkgFiles.length === 0) {
                    vscode.window.showErrorMessage('Error: No .nupkg file found in the twistlock folder.');
                    return;
                }
                const nupkgFile = nupkgFiles[0];
                const twistlockVersion = nupkgFile.split('.').slice(-4, -1).join('.');

                const variableResponse = await fetch(variableEndpoint, {
                    method: 'POST',
                    headers: { ...headers, authorization: `Bearer ${token}` },
                    body: JSON.stringify(functionInfo)
                });

                const variableData = await variableResponse.json() as { data: string };
                const variableValue = variableData.data;

                if (!variableValue) {
                    vscode.window.showErrorMessage('Error: Failed to retrieve variable value.');
                    return;
                }

                await vscode.env.clipboard.writeText(variableValue);
                vscode.window.showInformationMessage('TW_POLICY variable value is copied to the clipboard.');

                const csprojFiles = fs.readdirSync(workspaceRoot).filter(file => file.endsWith('.csproj'));

                if (csprojFiles.length === 0) {
                    vscode.window.showErrorMessage('No .csproj file found in the project directory.');
                    return;
                }

                const csprojFile = csprojFiles[0];
                const csprojPath = path.join(workspaceRoot, csprojFile);
                let csprojContent = fs.readFileSync(csprojPath, 'utf8');
                const insertIndex = csprojContent.lastIndexOf('</Project>');
                const newContent = `
<ItemGroup>
<PackageReference Include="Twistlock" Version="${twistlockVersion}" />
<TwistlockFiles Include="twistlock\\*" Exclude="twistlock\\twistlock.${twistlockVersion}.nupkg" />
</ItemGroup>
<ItemGroup>
<None Include="@(TwistlockFiles)" CopyToOutputDirectory="Always" LinkBase="twistlock\\" />
</ItemGroup>`;
                csprojContent = csprojContent.slice(0, insertIndex) + newContent + csprojContent.slice(insertIndex);
                fs.writeFileSync(csprojPath, csprojContent, 'utf8');
                vscode.window.showInformationMessage(`Prisma Cloud Serverless Defender added to ${csprojFile}`);

                const nugetConfigPath = path.join(workspaceRoot, 'NuGet.Config');
                const nugetConfigContent = `
<?xml version="1.0" encoding="utf-8"?>
<configuration>
    <packageSources>
        <clear />
        <add key="local-packages" value="./twistlock/" />
        <add key="nuget.org" value="https://api.nuget.org/v3/index.json" protocolVersion="3" />
    </packageSources>
</configuration>`;

                if (!fs.existsSync(nugetConfigPath)) {
                    fs.writeFileSync(nugetConfigPath, nugetConfigContent, 'utf8');
                    vscode.window.showInformationMessage('NuGet.Config created successfully.');
                } else {
                    let existingNugetConfig = fs.readFileSync(nugetConfigPath, 'utf8');
                    if (!existingNugetConfig.includes('<add key="local-packages" value="./twistlock/" />')) {
                        existingNugetConfig = existingNugetConfig.replace('<packageSources>', `<packageSources>
                            <add key="local-packages" value="./twistlock/" />`);
                        fs.writeFileSync(nugetConfigPath, existingNugetConfig, 'utf8');
                        vscode.window.showInformationMessage('NuGet.Config updated successfully.');
                    } else {
                        vscode.window.showInformationMessage('NuGet.Config already contains the local-packages source.');
                    }
                }

            } catch (error: unknown) {
                if (error instanceof Error) {
                    vscode.window.showErrorMessage(`Error: ${error.message}`);
                } else {
                    vscode.window.showErrorMessage(`Error: ${JSON.stringify(error)}`);
                }
            }
        } catch (error) {
            if (error instanceof Error) {
                vscode.window.showErrorMessage(`Error: ${error.message}`);
            } else {
                vscode.window.showErrorMessage(`Error: ${JSON.stringify(error)}`);
            }
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}