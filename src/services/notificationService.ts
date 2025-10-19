import { toast } from 'sonner';

export class NotificationService {
    static success(message: string) {
        toast.success(message);
    }

    static error(message: string) {
        toast.error(message);
    }

    static warning(message: string) {
        toast.warning(message);
    }

    static info(message: string) {
        toast.info(message);
    }

    static loading(message: string) {
        return toast.loading(message);
    }

    static dismiss(id?: string | number) {
        toast.dismiss(id);
    }

    // Specific notification types for the app
    static projectCreated(name: string) {
        this.success(`Project "${name}" created successfully!`);
    }

    static projectDeleted(name: string) {
        this.success(`Project "${name}" deleted successfully!`);
    }

    static promptCreated(name: string) {
        this.success(`Prompt "${name}" created successfully!`);
    }

    static promptDeleted(name: string) {
        this.success(`Prompt "${name}" deleted successfully!`);
    }

    static promptSaved(name: string) {
        this.success(`Prompt "${name}" saved successfully!`);
    }

    static versionCreated() {
        this.success('New version created successfully!');
    }

    static projectExported(name: string) {
        this.success(`Project "${name}" exported successfully!`);
    }

    static projectImported(name: string) {
        this.success(`Project "${name}" imported successfully!`);
    }

    static importError(error: string) {
        this.error(`Import failed: ${error}`);
    }

    static saveError(error: string) {
        this.error(`Save failed: ${error}`);
    }

    static autoSaveSuccess() {
        this.info('Auto-saved successfully');
    }
}
