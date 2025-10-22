let gisLoaded = false;
let tokenClient: any = null;
let accessToken: string | null = null;
let tokenExpiry: number = 0;

const GIS_SRC = 'https://accounts.google.com/gsi/client';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const SCOPES = [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
].join(' ');

function loadGisScript(): Promise<void> {
    if (gisLoaded) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${GIS_SRC}"]`);
        if (existing) {
            gisLoaded = true;
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = GIS_SRC;
        script.async = true;
        script.onload = () => {
            gisLoaded = true;
            resolve();
        };
        script.onerror = () => reject(new Error('Failed to load Google Identity Services script'));
        document.head.appendChild(script);
    });
}

async function ensureTokenClient(): Promise<void> {
    await loadGisScript();
    // @ts-ignore
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
        throw new Error('Google Identity Services unavailable');
    }
    if (!CLIENT_ID) throw new Error('Missing VITE_GOOGLE_CLIENT_ID');
    if (tokenClient) return;
    // @ts-ignore
    tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        prompt: '',
        callback: (resp: any) => {
            if (resp.error) return;
            accessToken = resp.access_token;
            tokenExpiry = Date.now() + (resp.expires_in ? resp.expires_in * 1000 : 3500 * 1000);
            pendingResolve?.(accessToken!);
            pendingResolve = null;
        }
    });
}

let pendingResolve: ((t: string) => void) | null = null;

export async function getAccessToken(interactive: boolean = true): Promise<string> {
    await ensureTokenClient();
    if (accessToken && Date.now() < tokenExpiry - 5000) return accessToken;
    return new Promise<string>((resolve, reject) => {
        pendingResolve = resolve;
        try {
            tokenClient.requestAccessToken({ prompt: interactive ? 'consent' : '' });
        } catch (e) {
            pendingResolve = null;
            reject(e);
        }
    });
}

export function clearToken() {
    accessToken = null;
    tokenExpiry = 0;
}

export async function signIn(): Promise<{ token: string }> {
    const token = await getAccessToken(true);
    return { token };
}

export function signOut(): void {
    clearToken();
}


