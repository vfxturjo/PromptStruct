import { useState, useEffect } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { NotificationService } from '@/services/notificationService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Settings, Save, Trash2, Download, Upload, Palette, LogIn, LogOut, RefreshCw, HardDrive } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { signIn, signOut } from '@/services/googleAuth';
import { getQuota, deleteAllAppData } from '@/services/driveService';
import { syncNow } from '@/services/syncService';

interface GlobalSettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

export function GlobalSettings({ isOpen, onClose }: GlobalSettingsProps) {
    const {
        uiShowFavourites,
        setUiShowFavourites,
        setProjects,
        setPrompts,
        setVersions,
        setCurrentProject,
        setCurrentPrompt,
        setPreviewMode,
        setUiHelpPanelExpanded,
        setUiPanelLayout,
        setUiCollapsedByElementId,
        setUiGlobalControlValues,
    } = useEditorStore();

    const { theme, setTheme } = useTheme();
    const [autoSaveInterval, setAutoSaveInterval] = useState(30);
    const [defaultExportFormat, setDefaultExportFormat] = useState<'json' | 'markdown' | 'txt'>('json');
    const { sync, setSyncState } = useEditorStore();

    useEffect(() => {
        // Attempt to refresh quota on open if signed in
        if (isOpen && sync.isSignedIn) {
            getQuota().then((q) => setSyncState({ quota: q.storageQuota })).catch(() => { });
        }
    }, [isOpen]);

    const handleSave = () => {
        try {
            // Settings are automatically saved to store via state updates
            NotificationService.success('Settings saved!');
            onClose();
        } catch (error) {
            NotificationService.error(`Failed to save settings: ${error}`);
        }
    };

    const handleClearAllData = () => {
        if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            try {
                setProjects([]);
                setPrompts([]);
                setVersions([]);
                setCurrentProject(null);
                setCurrentPrompt(null);
                setPreviewMode('clean');
                setUiHelpPanelExpanded(true);
                setUiPanelLayout(undefined);
                setUiCollapsedByElementId({});
                setUiGlobalControlValues({});

                NotificationService.success('All data cleared successfully!');
                onClose();
            } catch (error) {
                NotificationService.error(`Failed to clear data: ${error}`);
            }
        }
    };

    const handleSignIn = async () => {
        try {
            await signIn();
            setSyncState({ isSignedIn: true, status: 'idle' });
            const q = await getQuota();
            setSyncState({ quota: q.storageQuota });
            NotificationService.success('Signed in to Google');
        } catch (e) {
            NotificationService.error(`Sign-in failed: ${e}`);
        }
    };

    const handleSignOut = () => {
        try {
            signOut();
            setSyncState({ isSignedIn: false, quota: null });
            NotificationService.success('Signed out');
        } catch (e) {
            NotificationService.error(`Sign-out failed: ${e}`);
        }
    };

    const handleDriveDeleteAll = async () => {
        if (!window.confirm('Delete ALL synced data in Google Drive AppData? This cannot be undone.')) return;
        try {
            await deleteAllAppData();
            NotificationService.success('All Google Drive AppData deleted');
        } catch (e) {
            NotificationService.error(`Delete failed: ${e}`);
        }
    };

    const handleSyncNow = async () => {
        try {
            await syncNow();
            NotificationService.success('Sync completed');
        } catch (e) {
            NotificationService.error(`Sync failed: ${e}`);
        }
    };

    const handleExportSettings = () => {
        try {
            const settingsData = {
                uiShowFavourites,
                theme,
                autoSaveInterval,
                defaultExportFormat,
                exportedAt: new Date().toISOString(),
                version: 'settings'
            };

            const dataStr = JSON.stringify(settingsData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `promptstruct_settings_${Date.now()}.json`;
            link.click();
            URL.revokeObjectURL(url);

            NotificationService.success('Settings exported successfully!');
        } catch (error) {
            NotificationService.error(`Failed to export settings: ${error}`);
        }
    };

    const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);

                if (data.uiShowFavourites !== undefined) {
                    setUiShowFavourites(data.uiShowFavourites);
                }
                if (data.theme) {
                    setTheme(data.theme);
                }
                if (data.autoSaveInterval) {
                    setAutoSaveInterval(data.autoSaveInterval);
                }
                if (data.defaultExportFormat) {
                    setDefaultExportFormat(data.defaultExportFormat);
                }

                NotificationService.success('Settings imported successfully!');
            } catch (error) {
                NotificationService.error(`Failed to import settings: ${error}`);
            }
        };
        reader.readAsText(file);

        // Reset file input to allow importing the same file again
        event.target.value = '';
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Global Settings
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Appearance */}
                    <div className="space-y-3">
                        <h4 className="text-lg font-semibold flex items-center gap-2">
                            <Palette className="w-4 h-4" />
                            Appearance
                        </h4>

                        <div className="space-y-2">
                            <Label htmlFor="theme-select">Theme</Label>
                            <Select value={theme} onValueChange={setTheme}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator />

                    {/* Google Account */}
                    <div className="space-y-3">
                        <h4 className="text-lg font-semibold flex items-center gap-2">
                            <HardDrive className="w-4 h-4" />
                            Google Account & Sync
                        </h4>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Authentication</Label>
                                <p className="text-sm text-muted-foreground">
                                    Sign in to sync your projects to Google Drive AppData
                                </p>
                            </div>
                            {sync.isSignedIn ? (
                                <Button variant="outline" onClick={handleSignOut}>
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign out
                                </Button>
                            ) : (
                                <Button onClick={handleSignIn}>
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Sign in
                                </Button>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Drive Storage Usage</Label>
                                <p className="text-sm text-muted-foreground">
                                    {sync.quota ? `${sync.quota.usageInDrive ?? sync.quota.usage ?? 0} / ${sync.quota.limit ?? 0} bytes` : 'Not available'}
                                </p>
                            </div>
                            <Button variant="outline" onClick={async () => {
                                try { const q = await getQuota(); setSyncState({ quota: q.storageQuota }); } catch { }
                            }}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </Button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Sync Now</Label>
                                <p className="text-sm text-muted-foreground">
                                    Manually push/pull changes (last-write-wins)
                                </p>
                            </div>
                            <Button onClick={handleSyncNow} disabled={!sync.isSignedIn}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Sync Now
                            </Button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Delete All Synced Data</Label>
                                <p className="text-sm text-muted-foreground">
                                    Permanently remove all data from AppData space
                                </p>
                            </div>
                            <Button variant="destructive" onClick={handleDriveDeleteAll} disabled={!sync.isSignedIn}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete All (Drive)
                            </Button>
                        </div>
                    </div>

                    {/* Projects */}
                    <div className="space-y-3">
                        <h4 className="text-lg font-semibold">Projects</h4>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Show Favourites Project</Label>
                                <p className="text-sm text-muted-foreground">
                                    Display a virtual project containing all your favorite prompts
                                </p>
                            </div>
                            <Switch
                                checked={uiShowFavourites}
                                onCheckedChange={setUiShowFavourites}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Editor */}
                    <div className="space-y-3">
                        <h4 className="text-lg font-semibold">Editor</h4>

                        <div className="space-y-2">
                            <Label htmlFor="auto-save-interval">Auto-save Interval (seconds)</Label>
                            <Select value={autoSaveInterval.toString()} onValueChange={(value) => setAutoSaveInterval(Number(value))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10 seconds</SelectItem>
                                    <SelectItem value="30">30 seconds</SelectItem>
                                    <SelectItem value="60">1 minute</SelectItem>
                                    <SelectItem value="300">5 minutes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="export-format">Default Export Format</Label>
                            <Select value={defaultExportFormat} onValueChange={(value) => setDefaultExportFormat(value as 'json' | 'markdown' | 'txt')}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="json">JSON</SelectItem>
                                    <SelectItem value="markdown">Markdown</SelectItem>
                                    <SelectItem value="txt">Plain Text</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator />

                    {/* Advanced */}
                    <div className="space-y-3">
                        <h4 className="text-lg font-semibold">Advanced</h4>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Export Settings</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Export your current settings to a file
                                    </p>
                                </div>
                                <Button variant="outline" onClick={handleExportSettings}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Export
                                </Button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Import Settings</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Import settings from a previously exported file
                                    </p>
                                </div>
                                <Button variant="outline" onClick={() => document.getElementById('import-settings')?.click()}>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Import
                                </Button>
                                <input
                                    id="import-settings"
                                    type="file"
                                    accept=".json"
                                    onChange={handleImportSettings}
                                    className="hidden"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Clear All Data</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Remove all projects, prompts, and settings
                                    </p>
                                </div>
                                <Button variant="destructive" onClick={handleClearAllData}>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Clear All
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Settings
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
