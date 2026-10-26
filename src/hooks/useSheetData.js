import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchSheetData, isConfigured } from '../utils/audienciasSheet';
/**
 * Reads a Google Sheet and keeps it up to date:
 *  - every `intervalMs` (only while the page is visible);
 *  - when the browser tab becomes visible or gets focus again;
 *  - on demand, through `refresh()`.
 * `source` must be a stable object (a module-level constant), not one created on each render.
 */
export function useSheetData(source, intervalMs) {
    const configured = isConfigured(source);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(configured);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const inFlight = useRef(false);
    const refresh = useCallback(async () => {
        if (!configured || inFlight.current)
            return;
        inFlight.current = true;
        setRefreshing(true);
        try {
            const result = await fetchSheetData(source);
            setData(result);
            setError(null);
            setLastUpdated(new Date());
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao ler a planilha.');
        }
        finally {
            inFlight.current = false;
            setRefreshing(false);
            setLoading(false);
        }
    }, [configured, source]);
    useEffect(() => {
        if (!configured)
            return undefined;
        refresh();
        const interval = window.setInterval(() => {
            if (document.visibilityState === 'visible')
                refresh();
        }, intervalMs);
        const onVisible = () => {
            if (document.visibilityState === 'visible')
                refresh();
        };
        document.addEventListener('visibilitychange', onVisible);
        window.addEventListener('focus', onVisible);
        return () => {
            window.clearInterval(interval);
            document.removeEventListener('visibilitychange', onVisible);
            window.removeEventListener('focus', onVisible);
        };
    }, [configured, refresh, intervalMs]);
    return { data, error, loading, refreshing, lastUpdated, configured, refresh };
}
