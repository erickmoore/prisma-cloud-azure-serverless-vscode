import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export async function updateNugetConfig(workspaceRoot: string) {
    const nugetConfigPath = path.join(workspaceRoot, 'NuGet.Config');
    const nugetConfigContent = 
`<?xml version="1.0" encoding="utf-8"?>
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
            existingNugetConfig = existingNugetConfig.replace(
'<packageSources>', 
`<packageSources>
    <add key="local-packages" value="./twistlock/" />
`);
            fs.writeFileSync(nugetConfigPath, existingNugetConfig, 'utf8');
            vscode.window.showInformationMessage('NuGet.Config updated successfully.');
        } else {
            vscode.window.showInformationMessage('NuGet.Config already contains the local-packages source.');
        }
    }
}