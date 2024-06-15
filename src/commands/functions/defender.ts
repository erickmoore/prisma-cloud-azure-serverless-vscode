// // src/commands/download.ts
// import fetch from 'node-fetch';
// import * as vscode from 'vscode';
// import * as fs from 'fs';
// import * as path from 'path';

// export async function installDefender(consolePath: string, token: string, context: vscode.ExtensionContext, workspaceRoot: string){
//     console.log(context);
//     const filePath = await downloadFiles(consolePath, token, context);
//     console.log('File Path:', filePath);
//     await extractDefender(filePath, context);
//     const twistlockVersion = await getDefenderVersion(workspaceRoot, filePath);

//     return twistlockVersion;
// }

// async function downloadFiles(consolePath: string, token: string, context: vscode.ExtensionContext) {
//     const bundleEndpoint = `${consolePath}/api/v1/defenders/serverless/bundle`;
//     const headers = {
//         'Content-Type': 'application/octet-stream',
//         authorization: `Bearer ${token}`,
//     };

//     const response = await fetch(bundleEndpoint, {
//         method: 'POST',
//         headers: headers,
//         body: JSON.stringify({ runtime: 'dotnet', provider: 'azure' }),
//     });

//     const arrayBuffer = await response.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);
//     console.log(context);
//     const zipPath = path.join(context.extensionPath, 'twistlock_serverless_defender.zip');
//     fs.writeFileSync(zipPath, buffer);

//     if (!fs.existsSync(zipPath) || fs.statSync(zipPath).size === 0) {
//         throw new Error('Failed to download defender bundle. ZIP file is empty.');
//     }

//     return zipPath;
// }

// async function extractDefender(zipPath: string, context: vscode.ExtensionContext) {
//     const unzipper = (await import('unzipper')).default;
//     const extractPath = path.join(context.extensionPath, 'twistlock_temp');
//     await fs.createReadStream(zipPath).pipe(unzipper.Extract({ path: extractPath })).promise();

//     if (fs.existsSync(extractPath)) {
//         const files = fs.readdirSync(extractPath);
//         if (files.length === 0) {
//             throw new Error('Extraction failed. No files found.');
//         }
//         console.log('Extracted files:', files);
//         return extractPath;
//     } else {
//         throw new Error('Extraction failed. Directory does not exist.');
//     }
// }

// async function getDefenderVersion(workspaceRoot: string, extractPath: string){
//     const targetPath = path.join(workspaceRoot, 'twistlock');

//     if (fs.existsSync(targetPath)) {
//         fs.rmdirSync(targetPath, { recursive: true });
//     }

//     console.log('Moving files from', path.join(extractPath, 'twistlock'), 'to', targetPath);
//     fs.renameSync(path.join(extractPath, 'twistlock'), targetPath);

//     fs.rmdirSync(extractPath, { recursive: true });

//     const nupkgFiles = fs.readdirSync(targetPath).filter(file => file.endsWith('.nupkg'));
//     if (nupkgFiles.length === 0) {
//         vscode.window.showErrorMessage('Error: No .nupkg file found in the twistlock folder.');
//         return;
//     }
//     const nupkgFile = nupkgFiles[0];
//     const twistlockVersion = nupkgFile.split('.').slice(-4, -1).join('.');

//     return twistlockVersion;
// }
