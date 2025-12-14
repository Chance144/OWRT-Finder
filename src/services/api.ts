import * as FileSystem from 'expo-file-system';
import { OpenWrtDevice, TohData } from '../types/device';
import { MOCK_TOH_DATA } from './mockData';

const TOH_JSON_URL = 'https://openwrt.org/toh.json';
const CACHE_FILE_URI = FileSystem.documentDirectory + 'toh-cache.json';

// In-memory cache
let cachedDevices: OpenWrtDevice[] | null = null;

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
        
        // Cache the valid response asynchronously (don't await to block UI)
        FileSystem.writeAsStringAsync(CACHE_FILE_URI, text)
            .then(() => console.log('Successfully cached TOH data'))
            .catch(err => console.warn('Failed to cache TOH data:', err));

        const devices = processData(json);
        cachedDevices = devices;
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
                return devices;
            } else {
                throw new Error('No offline cache available');
            }
        } catch (cacheError) {
            console.warn('Offline cache failed, using mock data. Error:', cacheError);
            const devices = processData(MOCK_TOH_DATA);
            cachedDevices = devices;
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
