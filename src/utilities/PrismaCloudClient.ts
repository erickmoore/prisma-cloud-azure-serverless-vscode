import axios from 'axios';
import * as vscode from 'vscode';

export interface AuthConfig {
    consolePath: string;
    identity: string;
    secret: string;
}

export interface ApiConfig {
    apiEndpoint: string;
    headers: Record<string, string>;
    method: 'GET' | 'POST';
    body?: any;
    isFile: true | false;
}

export class PrismaCloudAPI {
    private static instance: PrismaCloudAPI;
    private authConfig: AuthConfig | undefined;
    private authToken: string | undefined;
    private consoleVersion: string | undefined;
    private tokenRefreshInterval: NodeJS.Timeout | undefined;

    private constructor() {
        this.initializeTokenRefresh();
    }

    public static getInstance(): PrismaCloudAPI {
        if (!PrismaCloudAPI.instance) {
            PrismaCloudAPI.instance = new PrismaCloudAPI();
        }
        return PrismaCloudAPI.instance;
    }

    private async fetchAuthConfig(): Promise<void> {
        const config = vscode.workspace.getConfiguration('PrismaCloudEnt');
        const identity = config.get('identity') as string;
        const secret = config.get('secret') as string;
        const consolePath = config.get('console') as string;

        if (!identity || !secret || !consolePath) {
            const openSettings = await vscode.window.showWarningMessage(
                'Prisma Cloud Serverless settings are not configured. Please configure them in the settings.', 
                'Open Settings'
            );

            if (openSettings === 'Open Settings') {
                await vscode.commands.executeCommand('workbench.action.openSettings', 'PrismaCloudEnt');
            }
        }

        this.authConfig = { identity, secret, consolePath };
    }

    private async authenticate(): Promise<void> {
        if (!this.authConfig) {
            await this.fetchAuthConfig();
        }

        const authEndpoint = `${this.authConfig!.consolePath}/api/v1/authenticate`;
        const headers = { 'Content-Type': 'application/json; charset=UTF-8' };
        const payload = { username: this.authConfig!.identity, password: this.authConfig!.secret };

        const response = await axios.post(authEndpoint, payload, { headers });

        if (response.status !== 200) {
            throw new Error('Failed to authenticate with Prisma Cloud.');
        }

        this.authToken = response.data.token;
    }

    private initializeTokenRefresh(): void {
        this.authenticate(); // Authenticate immediately on instantiation
        this.tokenRefreshInterval = setInterval(() => {
            this.authenticate().catch(err => {
                console.error('Error refreshing token:', err);
            });
        }, 8 * 60 * 1000); // 8 minutes in milliseconds
    }

    private async fetchConsoleVersion(): Promise<void> {
        if (!this.authToken) {
            await this.authenticate();
        }

        const apiConfig: ApiConfig = {
            apiEndpoint: '/api/v1/version',
            headers: { 'Content-Type': 'application/json', 'authorization': `Bearer ${this.authToken}` },
            method: 'GET',
            isFile: false
        };

        const response = await axios({
            method: apiConfig.method,
            url: `${this.authConfig!.consolePath}${apiConfig.apiEndpoint}`,
            headers: apiConfig.headers,
        });

        if (!response) {
            throw new Error('No response from API.');
        }

        this.consoleVersion = response.data;
        console.log('Console version:', this.consoleVersion);
    }

    public async makeApiCall(api: ApiConfig): Promise<object | Buffer | undefined> {
        if (!this.authToken) {
            await this.authenticate();
        }

        api.headers['authorization'] = `Bearer ${this.authToken}`;
        const apiUrl = `${this.authConfig!.consolePath}${api.apiEndpoint}`;

        console.log('API URL: ', apiUrl);

        const response = await axios({
            method: api.method,
            url: apiUrl,
            headers: api.headers,
            data: api.body,
            responseType: api.isFile ? 'arraybuffer' : 'json'
        });

        if (!response) {
            throw new Error('No response from API.');
        }

        if (response.headers['content-type']?.includes('application/zip')) {
            const zipFile = Buffer.from(response.data);
            console.log('Response size:', zipFile.length);

            return zipFile;
        }

        if (response.headers['content-type']?.includes('application/json')) {
            return response.data.data;
        }

        return;
    }

    public async getConsoleVersion(): Promise<string | undefined> {
        if (!this.consoleVersion) {
            await this.fetchConsoleVersion();
        }
        return this.consoleVersion;
    }

    public getAuthConfig(): AuthConfig | undefined {
        return this.authConfig;
    }

    public getConsolePath(): string | undefined {
        return this.authConfig?.consolePath;
    }
    
    public static async consolePath(): Promise<string | undefined> {
        const instance = PrismaCloudAPI.getInstance();
        if (!instance.authConfig) {
            await instance.fetchAuthConfig();
        }
        return instance.getConsolePath();
    }    

    public getIdentity(): string | undefined {
        return this.authConfig?.identity;
    }

    public getSecret(): string | undefined {
        return this.authConfig?.secret;
    }   

    public static getWorkspaceRoot(): string | undefined {
        const workspaceFolders = vscode.workspace.workspaceFolders;

        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('Error: No workspace folder is open.');
            return;
        }
  
        return workspaceFolders[0].uri.fsPath;
    }
}