// src/commands/auth.ts
import fetch from 'node-fetch';

export async function authenticate(consolePath: string, identity: string, secret: string) {
    const authEndpoint = `${consolePath}/api/v32.06/authenticate`;
    const headers = { 'Content-Type': 'application/json; charset=UTF-8' };
    const payload = { username: identity, password: secret };

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