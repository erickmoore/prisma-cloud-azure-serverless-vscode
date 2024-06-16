import fetch from 'node-fetch';

export interface AuthenticateConfig {
    consolePath: string;
    identity: string;
    secret: string;
}

export async function authenticate(config: AuthenticateConfig): Promise<string> {
    const authEndpoint = `${config.consolePath}/api/v32.06/authenticate`;
    const headers = { 'Content-Type': 'application/json; charset=UTF-8' };
    const payload = { username: config.identity, password: config.secret };

    const response = await fetch(authEndpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error('Failed to authenticate with Prisma Cloud.');
    }

    const data = await response.json() as { token: string };
    return data.token;
}