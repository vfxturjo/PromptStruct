export class NotificationService {
    static success(message: string) {
        console.log('✅ Success:', message);
    }

    static error(message: string) {
        console.error('❌ Error:', message);
    }

    static warning(message: string) {
        console.warn('⚠️ Warning:', message);
    }

    static info(message: string) {
        console.info('ℹ️ Info:', message);
    }

    static loading(message: string) {
        console.log('⏳ Loading:', message);
        return 'loading-id';
    }

    static dismiss(id?: string | number) {
        console.log('Dismissed notification:', id);
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
