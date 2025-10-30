import { Project, Prompt, Version, ImportAnalysis, ImportConflict } from '@/types';

export function analyzeImportData(
    data: any,
    existingProjects: Project[],
    existingPrompts: Prompt[],
    existingVersions: Version[]
): ImportAnalysis {
    // Detect import type and extract data
    let type: ImportAnalysis['type'] = 'prompt';
    let projects: Project[] = [];
    let prompts: Prompt[] = [];
    let versions: Version[] = [];

    if (data.project && !data.projects) {
        // Single project export
        type = 'project';
        projects = [data.project];
        prompts = data.prompts || [];
        versions = data.versions || [];
    } else if (data.projects && Array.isArray(data.projects)) {
        if (data.uiState) {
            // Full workspace export
            type = 'workspace';
            projects = data.projects;
            prompts = data.prompts || [];
            versions = data.versions || [];
        } else if (data.projects.length === 1) {
            // Single project (but in projects array)
            type = 'project';
            projects = data.projects;
            prompts = data.prompts || [];
            versions = data.versions || [];
        } else {
            // Multiple projects
            type = 'bulk-projects';
            projects = data.projects;
            prompts = data.prompts || [];
            versions = data.versions || [];
        }
    } else if (data.prompts && Array.isArray(data.prompts)) {
        if (data.prompts.length === 1) {
            // Single prompt (but in prompts array)
            type = 'prompt';
            prompts = data.prompts;
            versions = data.versions || [];
        } else {
            // Multiple prompts
            type = 'bulk-prompts';
            prompts = data.prompts;
            versions = data.versions || [];
        }
    } else if (data.prompt) {
        // Single prompt export
        type = 'prompt';
        prompts = [data.prompt];
        versions = data.versions || [];
    }

    // Detect conflicts
    const conflicts: ImportConflict[] = [];
    
    // Check project conflicts
    projects.forEach(project => {
        const existing = existingProjects.find(p => p.id === project.id);
        if (existing) {
            conflicts.push({
                id: project.id,
                name: project.name,
                type: 'project',
                resolution: 'overwrite'
            });
        }
    });

    // Check prompt conflicts
    prompts.forEach(prompt => {
        const existing = existingPrompts.find(p => p.id === prompt.id);
        if (existing) {
            conflicts.push({
                id: prompt.id,
                name: prompt.name,
                type: 'prompt',
                resolution: 'overwrite'
            });
        }
    });

    // Check version conflicts
    versions.forEach(version => {
        const existing = existingVersions.find(v => v.id === version.id);
        if (existing) {
            conflicts.push({
                id: version.id,
                name: `Version from ${new Date(version.createdAt).toLocaleDateString()}`,
                type: 'version',
                resolution: 'overwrite'
            });
        }
    });

    return {
        type,
        projects,
        prompts,
        versions,
        conflicts
    };
}

export function applyImportResolutions(
    analysis: ImportAnalysis,
    resolutions: ImportConflict[]
): { projects: Project[]; prompts: Prompt[]; versions: Version[] } {
    const resolutionMap = new Map(resolutions.map(r => [r.id, r]));
    
    let projects: Project[] = [];
    let prompts: Prompt[] = [];
    let versions: Version[] = [];

    // Apply project resolutions
    projects = analysis.projects.map(project => {
        const resolution = resolutionMap.get(project.id);
        if (resolution) {
            if (resolution.resolution === 'skip') {
                return null;
            } else if (resolution.resolution === 'duplicate') {
                return { ...project, id: `proj_${Date.now()}_${project.id}` };
            }
        }
        return project;
    }).filter(Boolean) as Project[];

    // Apply prompt resolutions
    prompts = analysis.prompts.map(prompt => {
        const resolution = resolutionMap.get(prompt.id);
        if (resolution) {
            if (resolution.resolution === 'skip') {
                return null;
            } else if (resolution.resolution === 'duplicate') {
                // Generate new ID and update associated versions
                const newId = `prompt_${Date.now()}_${prompt.id}`;
                const associatedVersions = analysis.versions.filter(v => v.promptId === prompt.id);
                associatedVersions.forEach(v => {
                    const versionRes = resolutionMap.get(v.id);
                    if (versionRes && versionRes.resolution !== 'skip') {
                        versions.push({ ...v, id: `ver_${Date.now()}_${v.id}`, promptId: newId });
                    }
                });
                return { ...prompt, id: newId };
            }
        }
        return prompt;
    }).filter(Boolean) as Prompt[];

    // Apply version resolutions (only those not already processed)
    analysis.versions.forEach(version => {
        const resolution = resolutionMap.get(version.id);
        if (resolution && resolution.resolution === 'skip') {
            return; // Skip this version
        }
        
        // Check if this version was already added during prompt duplication
        const alreadyAdded = versions.some(v => v.id === version.id || v.promptId === version.promptId);
        if (!alreadyAdded) {
            if (resolution && resolution.resolution === 'duplicate') {
                versions.push({ ...version, id: `ver_${Date.now()}_${version.id}` });
            } else {
                versions.push(version);
            }
        }
    });

    return { projects, prompts, versions };
}

export function detectConflicts<T extends { id: string; name?: string }>(
    importItems: T[],
    existingItems: T[]
): ImportConflict[] {
    return importItems
        .filter(importItem => existingItems.some(existing => existing.id === importItem.id))
        .map(item => ({
            id: item.id,
            name: item.name || item.id,
            type: 'prompt' as const, // This would need to be passed as parameter
            resolution: 'overwrite' as const
        }));
}

