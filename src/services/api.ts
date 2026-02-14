import * as FileSystem from 'expo-file-system';
import { OpenWrtDevice, TohData } from '../types/device';
import { MOCK_TOH_DATA } from './mockData';

const TOH_JSON_URL = 'https://openwrt.org/toh.json';
const CACHE_FILE_URI = FileSystem.documentDirectory + 'toh-cache.json';
const CACHE_META_URI = FileSystem.documentDirectory + 'toh-cache-meta.json';

// In-memory cache
let cachedDevices: OpenWrtDevice[] | null = null;
let cacheTimestamp: number | null = null;

export const clearCache = () => {
    cachedDevices = null;
};

export const getCacheAge = (): number | null => {
    if (!cacheTimestamp) return null;
    return Date.now() - cacheTimestamp;
};

export const fetchOpenWrtDevices = async (): Promise<OpenWrtDevice[]> => {
    if (cachedDevices) {
        return cachedDevices;
    }

    try {
        // Create a timeout promise that rejects after 10 seconds
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timed out')), 10000);
        });

        const response = await Promise.race([
            fetch(TOH_JSON_URL, {
                headers: {
                    'User-Agent': 'OpenWrtToHApp/1.0 (Mobile; Android) React-Native',
                    'Accept': 'application/json'
                }
            }),
            timeoutPromise
        ]) as Response;

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        
        // Validate JSON before caching
        const json: TohData = JSON.parse(text);
        
        const now = Date.now();
        // Cache the valid response asynchronously (don't await to block UI)
        Promise.all([
            FileSystem.writeAsStringAsync(CACHE_FILE_URI, text),
            FileSystem.writeAsStringAsync(CACHE_META_URI, JSON.stringify({ timestamp: now })),
        ])
            .then(() => console.log('Successfully cached TOH data'))
            .catch(err => console.warn('Failed to cache TOH data:', err));

        const devices = processData(json);
        cachedDevices = devices;
        cacheTimestamp = now;
        return devices;

    } catch (networkError) {
        console.warn('Network request failed, attempting to read from offline cache...', networkError);
        
        try {
            // Check if cache file exists
            const fileInfo = await FileSystem.getInfoAsync(CACHE_FILE_URI);
            
            if (fileInfo.exists) {
                console.log('Reading from offline cache');
                const cachedContent = await FileSystem.readAsStringAsync(CACHE_FILE_URI);
                const json: TohData = JSON.parse(cachedContent);
                const devices = processData(json);
                cachedDevices = devices;

                // Read cache meta
                try {
                    const metaInfo = await FileSystem.getInfoAsync(CACHE_META_URI);
                    if (metaInfo.exists) {
                        const meta = JSON.parse(await FileSystem.readAsStringAsync(CACHE_META_URI));
                        cacheTimestamp = meta.timestamp ?? null;
                    }
                } catch {
                    // ignore meta read errors
                }

                return devices;
            } else {
                throw new Error('No offline cache available');
            }
        } catch (cacheError) {
            console.warn('Offline cache failed, using mock data. Error:', cacheError);
            const devices = processData(MOCK_TOH_DATA);
            cachedDevices = devices;
            cacheTimestamp = Date.now();
            return devices;
        }
    }
};

const processData = (json: TohData): OpenWrtDevice[] => {
    const { columns, entries } = json;

    if (!entries) {
        console.error('Invalid JSON structure: missing entries', json);
        return [];
    }

    // Map column names to indices for faster lookup
    const colMap: Record<string, number> = {};
    columns.forEach((col, index) => {
        colMap[col] = index;
    });

    return entries.map((row) => {
        const getVal = (key: string) => {
            const idx = colMap[key];
            return idx !== undefined && row[idx] !== undefined ? String(row[idx]) : '';
        };

        return {
            deviceid: getVal('deviceid'),
            brand: getVal('brand'),
            model: getVal('model'),
            cpu: getVal('cpu'),
            cpumhz: getVal('cpumhz'),
            flashmb: getVal('flashmb'),
            rammb: getVal('rammb'),
            target: getVal('target'),
            subtarget: getVal('subtarget'),
            picture: getVal('picture'),
            firmwareopenwrtinstallurl: getVal('firmwareopenwrtinstallurl'),
            firmwareopenwrtupgradeurl: getVal('firmwareopenwrtupgradeurl'),
            supportedcurrentrel: getVal('supportedcurrentrel'),
        };
    });
};
