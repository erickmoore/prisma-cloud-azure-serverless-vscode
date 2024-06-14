import * as fs from 'fs';
import * as vscode from 'vscode';

export async function updateCsprojFile(csprojFile: string, twistlockVersion: string) {
    let csprojContent = fs.readFileSync(csprojFile, 'utf8');
    const insertIndex = csprojContent.lastIndexOf('</Project>');
    const newContent = `
<ItemGroup>
    <PackageReference Include="Twistlock" Version="${twistlockVersion}" />
    <TwistlockFiles Include="twistlock\\*" Exclude="twistlock\\twistlock.${twistlockVersion}.nupkg" />
</ItemGroup>
<ItemGroup>
    <None Include="@(TwistlockFiles)" CopyToOutputDirectory="Always" LinkBase="twistlock\\" />
</ItemGroup>

`;
    csprojContent = csprojContent.slice(0, insertIndex) + newContent + csprojContent.slice(insertIndex);
    fs.writeFileSync(csprojFile, csprojContent, 'utf8');
    vscode.window.showInformationMessage(`Prisma Cloud Serverless Defender added to ${csprojFile}`);
}