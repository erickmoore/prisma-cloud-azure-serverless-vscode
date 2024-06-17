import { updateConfig, UpdateConfigFile } from '../../utilities/updateConfig';

export async function updateCsprojFile(csprojFile: string, twistlockVersion: string) {
    const searchString = `<PackageReference Include="Twistlock" Version="${twistlockVersion}" />`;
    const insertAbove = '</Project>';
    const newContent = `    <!-- This function is protected by Prisma Cloud. Do not remove or modify this comment.
    https://docs.prismacloud.io/en/enterprise-edition/content-collections/runtime-security/install/deploy-defender/serverless/serverless -->
    <!-- Start of Prisma Cloud protected section --> -->    
    <ItemGroup>
        <PackageReference Include="Twistlock" Version="${twistlockVersion}" />
        <TwistlockFiles Include="twistlock\\*" Exclude="twistlock\\twistlock.${twistlockVersion}.nupkg" />
    </ItemGroup>
    <ItemGroup>
        <None Include="@(TwistlockFiles)" CopyToOutputDirectory="Always" LinkBase="twistlock\\" />
    </ItemGroup>
    <!-- End of Prisma Cloud protected section --> -->
`;
    const newFile = '';

    const successMessage = `Serverless Defender package references added to ${csprojFile}`;
    await updateConfig({ file: csprojFile, searchString, insertAbove, newContent, successMessage, newFile } as UpdateConfigFile);
}