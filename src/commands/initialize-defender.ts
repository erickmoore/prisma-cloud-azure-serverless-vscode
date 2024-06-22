import { PrismaCloudAPI } from '../services/PrismaCloudClient';
import { FilePrompt, Prompts } from '../services/Prompts';
import { initializeServerlessDefender, ServerlessFunctions } from './functions/initializeServerlessDefender';

export async function initializeDefender() {
    const filePath = await PrismaCloudAPI.getWorkspaceRoot() as string;
    const project = new Prompts;

    const promptConfig: FilePrompt = {
        fileDescription: 'C# Files',
        fileExtension: '.cs',
        fileSearchDirectory: filePath,
        title: 'Initialize Serverless Defender',
        placeHolder: 'select files to initialize...',
        fileIcon: 'file-code',
        pickMultiple: true
    };

    const selectedFunctions = await project.filePrompt(promptConfig) as string[];
    if (!selectedFunctions) { return; };

    const functionsToInitialize: ServerlessFunctions = {
        functionFiles: selectedFunctions
    };

    await initializeServerlessDefender(functionsToInitialize);
}