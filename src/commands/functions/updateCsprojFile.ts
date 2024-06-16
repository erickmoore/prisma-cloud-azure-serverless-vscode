import { updateConfig, UpdateConfigFile } from '../../utilities/updateConfig';

export async function updateCsprojFile(csprojFile: string, twistlockVersion: string) {
    const searchString = `<PackageReference Include="Twistlock" Version="${twistlockVersion}" />`;
    const insertAbove = '</Project>';
    const newContent = `
<ItemGroup>
    <PackageReference Include="Twistlock" Version="${twistlockVersion}" />
    <TwistlockFiles Include="twistlock\\*" Exclude="twistlock\\twistlock.${twistlockVersion}.nupkg" />
</ItemGroup>
<ItemGroup>
    <None Include="@(TwistlockFiles)" CopyToOutputDirectory="Always" LinkBase="twistlock\\" />
</ItemGroup>

`;
    const successMessage = `Serverless Defender package references added to ${csprojFile}`;

    await updateConfig({ file: csprojFile, searchString, insertAbove, newContent, successMessage } as UpdateConfigFile);
}