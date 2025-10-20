import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'vite-ui-compact'

export function CompactToggle() {
    const [isCompact, setIsCompact] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false
        const persisted = localStorage.getItem(STORAGE_KEY)
        if (persisted !== null) return persisted === 'true'
        return document.documentElement.classList.contains('tight')
    })

    useEffect(() => {
        const root = document.documentElement
        if (isCompact) {
            root.classList.add('tight')
        } else {
            root.classList.remove('tight')
        }
        localStorage.setItem(STORAGE_KEY, String(isCompact))
    }, [isCompact])

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCompact((c) => !c)}
            title={isCompact ? 'Switch to comfortable spacing' : 'Switch to compact spacing'}
        >
            {isCompact ? 'Comfort' : 'Compact'}
        </Button>
    )
}


