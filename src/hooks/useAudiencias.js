import { useCallback, useEffect, useRef, useState } from 'react';
import { AUDIENCIAS_CONFIG } from '../config/audiencias';
import { fetchSheetData, isConfigured } from '../utils/audienciasSheet';
/**
 * Reads the spreadsheet and keeps it up to date:
 *  - every `refreshIntervalMs` (only while the page is visible);
 *  - when the browser tab becomes visible or gets focus again;
 *  - on demand, through `refresh()`.
 */
export function useAudiencias() {
    const configured = isConfigured(AUDIENCIAS_CONFIG);
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
            const result = await fetchSheetData(AUDIENCIAS_CONFIG);
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
    }, [configured]);
    useEffect(() => {
        if (!configured)
            return undefined;
        refresh();
        const interval = window.setInterval(() => {
            if (document.visibilityState === 'visible')
                refresh();
        }, AUDIENCIAS_CONFIG.refreshIntervalMs);
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
    }, [configured, refresh]);
    return { data, error, loading, refreshing, lastUpdated, configured, refresh };
}
