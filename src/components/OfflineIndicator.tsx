import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { WifiOff } from 'lucide-react';

export function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Only show when offline
    if (isOnline) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Badge
                variant="destructive"
                className="flex items-center gap-2 px-3 py-2 shadow-lg"
            >
                <WifiOff className="h-4 w-4" />
                <span className="text-sm font-medium">Offline</span>
            </Badge>
        </div>
    );
}
