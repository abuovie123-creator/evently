import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useOnlineStatus(userId: string | undefined) {
    useEffect(() => {
        if (!userId) return;

        const supabase = createClient();

        const updateStatus = async () => {
            await supabase
                .from('profiles')
                .update({ last_seen_at: new Date().toISOString() })
                .eq('id', userId);
        };

        // Update immediately on mount
        updateStatus();

        // Update every 45 seconds to keep "Online" status (checked every 1 min)
        const interval = setInterval(updateStatus, 45000);

        return () => clearInterval(interval);
    }, [userId]);
}
