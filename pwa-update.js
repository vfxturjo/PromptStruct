// PWA Update Helper Script
// This script helps force PWA updates by clearing caches and reloading

console.log('🔄 PWA Update Helper - Starting update process...');

// Function to clear all caches
async function clearAllCaches() {
    try {
        // Clear service worker caches
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            console.log('📦 Found caches:', cacheNames);

            await Promise.all(
                cacheNames.map(cacheName => {
                    console.log(`🗑️ Deleting cache: ${cacheName}`);
                    return caches.delete(cacheName);
                })
            );
            console.log('✅ All caches cleared');
        }

        // Clear localStorage and sessionStorage
        localStorage.clear();
        sessionStorage.clear();
        console.log('✅ Storage cleared');

        return true;
    } catch (error) {
        console.error('❌ Error clearing caches:', error);
        return false;
    }
}

// Function to unregister service worker
async function unregisterServiceWorker() {
    try {
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            console.log('🔧 Found service workers:', registrations.length);

            await Promise.all(
                registrations.map(registration => {
                    console.log(`🗑️ Unregistering service worker: ${registration.scope}`);
                    return registration.unregister();
                })
            );
            console.log('✅ All service workers unregistered');
        }
        return true;
    } catch (error) {
        console.error('❌ Error unregistering service workers:', error);
        return false;
    }
}

// Function to force reload
function forceReload() {
    console.log('🔄 Forcing page reload...');
    window.location.reload(true);
}

// Main update function
async function forcePWAUpdate() {
    console.log('🚀 Starting PWA force update...');

    const cacheCleared = await clearAllCaches();
    const swUnregistered = await unregisterServiceWorker();

    if (cacheCleared && swUnregistered) {
        console.log('✅ PWA update preparation complete!');
        console.log('🔄 Reloading page to apply updates...');

        // Small delay to ensure all operations complete
        setTimeout(() => {
            forceReload();
        }, 1000);
    } else {
        console.log('⚠️ Some operations failed, but attempting reload anyway...');
        setTimeout(() => {
            forceReload();
        }, 1000);
    }
}

// Auto-run the update process
forcePWAUpdate();

// Also provide manual function for console use
window.forcePWAUpdate = forcePWAUpdate;
console.log('💡 You can also run forcePWAUpdate() manually in the console');
