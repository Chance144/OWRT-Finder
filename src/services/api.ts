import { OpenWrtDevice, TohData } from '../types/device';
import { MOCK_TOH_DATA } from './mockData';

const TOH_JSON_URL = 'https://openwrt.org/toh.json';

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
        // Sometimes APIs return BOM or weird chars, being safe
        const json: TohData = JSON.parse(text);
        const devices = processData(json);
        cachedDevices = devices;
        return devices;
    } catch (error) {
        console.warn('Failed to fetch OpenWrt TOH data, using mock data. Error:', error);
        const devices = processData(MOCK_TOH_DATA);
        cachedDevices = devices;
        return devices;
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
