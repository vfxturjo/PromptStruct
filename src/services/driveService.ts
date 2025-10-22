import { getAccessToken } from './googleAuth';

const DRIVE_V3 = 'https://www.googleapis.com/drive/v3';
const UPLOAD_V3 = 'https://www.googleapis.com/upload/drive/v3';

async function authFetch(input: RequestInfo, init: RequestInit = {}, interactive = false): Promise<Response> {
    const token = await getAccessToken(interactive);
    const headers = new Headers(init.headers || {});
    headers.set('Authorization', `Bearer ${token}`);
    return fetch(input, { ...init, headers });
}

export async function getQuota() {
    const res = await authFetch(`${DRIVE_V3}/about?fields=storageQuota`, { method: 'GET' }, false);
    if (!res.ok) throw new Error(`quota ${res.status}`);
    return res.json();
}

async function findFileByNameInAppData(name: string): Promise<{ id: string; name: string; modifiedTime?: string; headRevisionId?: string } | null> {
    const q = encodeURIComponent(`appDataFolder in parents and name = '${name}'`);
    const fields = encodeURIComponent('files(id,name,modifiedTime,headRevisionId)');
    const url = `${DRIVE_V3}/files?q=${q}&spaces=appDataFolder&fields=${fields}&pageSize=1`;
    const res = await authFetch(url, { method: 'GET' }, false);
    if (!res.ok) throw new Error(`find ${res.status}`);
    const data = await res.json();
    return data.files?.[0] || null;
}

async function createFileInAppData(name: string, content: string, mime = 'application/json') {
    const metadata = { name, parents: ['appDataFolder'] };
    const body = new FormData();
    body.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    body.append('file', new Blob([content], { type: mime }));
    const res = await authFetch(`${UPLOAD_V3}/files?uploadType=multipart`, { method: 'POST', body });
    if (!res.ok) throw new Error(`create ${res.status}`);
    return res.json();
}

async function updateFile(fileId: string, content: string, ifMatchRevisionId?: string, mime = 'application/json') {
    const metadata = {} as any;
    const body = new FormData();
    body.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    body.append('file', new Blob([content], { type: mime }));
    const headers: HeadersInit = {};
    if (ifMatchRevisionId) headers['If-Match'] = ifMatchRevisionId;
    const res = await authFetch(`${UPLOAD_V3}/files/${fileId}?uploadType=multipart`, { method: 'PATCH', headers, body });
    if (!res.ok) throw new Error(`update ${res.status}`);
    return res.json();
}

async function getFileContent(fileId: string) {
    const res = await authFetch(`${DRIVE_V3}/files/${fileId}?alt=media`, { method: 'GET' }, false);
    if (!res.ok) throw new Error(`read ${res.status}`);
    return res.text();
}

export async function readFile(name: string): Promise<{ content: string | null; id: string | null; headRevisionId?: string }> {
    const file = await findFileByNameInAppData(name);
    if (!file) return { content: null, id: null };
    const content = await getFileContent(file.id);
    return { content, id: file.id, headRevisionId: (file as any).headRevisionId };
}

export async function writeFile(name: string, content: string, ifMatchRevisionId?: string): Promise<{ id: string; headRevisionId?: string }> {
    const existing = await findFileByNameInAppData(name);
    if (!existing) {
        const created = await createFileInAppData(name, content);
        return { id: created.id, headRevisionId: created.headRevisionId };
    }
    const updated = await updateFile(existing.id, content, ifMatchRevisionId);
    return { id: updated.id, headRevisionId: updated.headRevisionId };
}

export async function ensureIndex(): Promise<{ id: string; content: any; headRevisionId?: string }> {
    const res = await readFile('index.json');
    if (!res.id || !res.content) {
        const index = { schemaVersion: 1, projects: [] as any[] };
        const created = await writeFile('index.json', JSON.stringify(index));
        return { id: created.id, content: index, headRevisionId: created.headRevisionId };
    }
    return { id: res.id, content: JSON.parse(res.content), headRevisionId: res.headRevisionId };
}

export async function listAllAppDataFiles(): Promise<Array<{ id: string }>> {
    const q = encodeURIComponent('appDataFolder in parents');
    const fields = encodeURIComponent('files(id)');
    const url = `${DRIVE_V3}/files?q=${q}&spaces=appDataFolder&fields=${fields}`;
    const res = await authFetch(url, { method: 'GET' }, false);
    if (!res.ok) throw new Error(`list ${res.status}`);
    const data = await res.json();
    return data.files || [];
}

export async function deleteAllAppData(): Promise<void> {
    const files = await listAllAppDataFiles();
    for (const f of files) {
        const res = await authFetch(`${DRIVE_V3}/files/${f.id}`, { method: 'DELETE' }, true);
        if (!res.ok && res.status !== 404) throw new Error(`delete ${res.status}`);
    }
}


