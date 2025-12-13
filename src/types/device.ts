export interface OpenWrtDevice {
    deviceid: string;
    brand: string;
    model: string;
    cpu: string;
    cpumhz: string;
    flashmb: string;
    rammb: string;
    target: string;
    subtarget: string;
    picture: string;
    firmwareopenwrtinstallurl: string;
    firmwareopenwrtupgradeurl: string;
    supportedcurrentrel: string;
    wifi?: string; // Sometimes inferred or extra
}

export interface TohData {
    columns: string[];
    entries: (string | number)[][]; // The raw data is an array of arrays mostly strings
}
