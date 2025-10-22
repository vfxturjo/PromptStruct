import { ensureIndex, readFile, writeFile } from './driveService';
import { useEditorStore } from '@/stores/editorStore';

type CatalogProject = { id: string; name: string; updatedAt: string; revisionId?: string };

export async function syncNow(): Promise<void> {
    const setSync = useEditorStore.getState().setSyncState;
    try {
        setSync({ status: 'syncing' });
        const index = await ensureIndex();

        const local = useEditorStore.getState();
        const localProjects = local.projects;
        const lastKnown = local.sync.lastKnownRevisionMap || {};

        // Build remote catalog map
        const remoteCatalog: Record<string, CatalogProject> = {};
        (index.content.projects as CatalogProject[]).forEach(p => { remoteCatalog[p.id] = p; });

        // Upsert each local project to remote last-write-wins
        for (const p of localProjects) {
            const fileName = `project-${p.id}.json`;
            const remote = await readFile(fileName);
            const localSnapshot = {
                schemaVersion: 1,
                id: p.id,
                name: p.name,
                content: { project: p, prompts: local.prompts.filter(pr => p.prompts.includes(pr.id)), versions: local.versions.filter(v => p.prompts.includes(v.promptId)) },
                updatedAt: new Date().toISOString(),
            };

            // Decide: if remote exists and has newer modifiedTime via catalog, prefer remote; else push local
            const remoteEntry = remoteCatalog[p.id];
            const remoteNewer = remoteEntry && remoteEntry.updatedAt && new Date(remoteEntry.updatedAt).getTime() > new Date(p.createdAt).getTime();

            if (remote.content && remoteNewer) {
                // Pull remote overwriting local (LWW)
                try {
                    const parsed = JSON.parse(remote.content);
                    // Minimal merge: replace project by id, upsert prompts/versions
                    const state = useEditorStore.getState();
                    const existingIdx = state.projects.findIndex(x => x.id === p.id);
                    if (existingIdx >= 0) {
                        state.updateProject(p.id, { ...parsed.content.project });
                    }
                    parsed.content.prompts.forEach((pr: any) => {
                        const idx = state.prompts.findIndex((x) => x.id === pr.id);
                        if (idx >= 0) state.updatePrompt(pr.id, pr); else state.addPrompt(pr);
                    });
                    parsed.content.versions.forEach((v: any) => {
                        const idx = state.versions.findIndex((x) => x.id === v.id);
                        if (idx >= 0) state.updateVersion(v.id, v); else state.addVersion(v);
                    });
                    // Update catalog entry locally
                } catch { }
            } else {
                // Push local; use If-Match when possible
                const rev = lastKnown[fileName];
                const res = await writeFile(fileName, JSON.stringify(localSnapshot), rev);
                lastKnown[fileName] = res.headRevisionId;
                // Update index catalog entry
                const entry: CatalogProject = { id: p.id, name: p.name, updatedAt: localSnapshot.updatedAt, revisionId: res.headRevisionId };
                remoteCatalog[p.id] = entry;
            }
        }

        // Write back index.json
        const catalogArray = Object.values(remoteCatalog);
        const indexWrite = await writeFile('index.json', JSON.stringify({ schemaVersion: 1, projects: catalogArray }), (index as any).headRevisionId);

        setSync({ status: 'success', lastSyncedAt: new Date().toISOString(), lastKnownRevisionMap: { ...lastKnown, 'index.json': indexWrite.headRevisionId }, pendingPush: false });
    } catch (e: any) {
        setSync({ status: 'error', errors: [String(e)] });
        throw e;
    }
}


