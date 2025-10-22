import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { GlobalSettings } from './GlobalSettings';
import { useState, ReactNode } from 'react';

interface TopBarProps {
    title: string;
    subtitle?: string;
    showBackButton?: boolean;
    onBackClick?: () => void;
    additionalButtons?: ReactNode; // Allow passing additional buttons
}

export function TopBar({ title, subtitle, showBackButton = false, onBackClick, additionalButtons }: TopBarProps) {
    const [showGlobalSettings, setShowGlobalSettings] = useState(false);

    return (
        <>
            <header className="border-b spacing-header flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {showBackButton && onBackClick && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onBackClick}
                                title="Back"
                            >
                                ←
                            </Button>
                        )}
                        <div>
                            <h1 className="text-2xl font-semibold">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {additionalButtons}
                        {/* Panel toggle buttons removed as requested */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowGlobalSettings(true)}
                            title="Global Settings"
                        >
                            <Settings className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <GlobalSettings
                isOpen={showGlobalSettings}
                onClose={() => setShowGlobalSettings(false)}
            />
        </>
    );
}
