import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { useNavigation } from '@react-navigation/native';
import { fetchOpenWrtDevices } from '../services/api';
import { OpenWrtDevice } from '../types/device';

export default function ScanScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanning, setScanning] = useState(false);
    const [scannedImage, setScannedImage] = useState<string | null>(null);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const cameraRef = useRef<CameraView>(null);
    const navigation = useNavigation<any>();
    const [devices, setDevices] = useState<OpenWrtDevice[]>([]);

    useEffect(() => {
        loadDevices();
    }, []);

    const loadDevices = async () => {
        try {
            const data = await fetchOpenWrtDevices();
            setDevices(data);
        } catch (error) {
            console.warn('Failed to load devices for lookup', error);
        }
    };

    const resetScan = () => {
        setScannedImage(null);
        setScanResult(null);
        setScanning(false);
    };

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
                    <Text style={styles.text}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const fuzzySearchFccId = (fccId: string): OpenWrtDevice | undefined => {
        const clean = fccId.replace(/[-\s]/g, '').toLowerCase();
        // Try matching against brand+model combos and model names
        return devices.find(d => {
            const brandModel = (d.brand + d.model).replace(/[-\s]/g, '').toLowerCase();
            const model = d.model.replace(/[-\s]/g, '').toLowerCase();
            return brandModel.includes(clean) || clean.includes(model) || model.includes(clean);
        });
    };

    const takePictureAndScan = async () => {
        if (!cameraRef.current) return;
        setScanning(true);
        setScanResult(null);

        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                skipProcessing: true,
            });

            if (!photo?.uri) throw new Error('Failed to capture image');

            setScannedImage(photo.uri);
            const result = await TextRecognition.recognize(photo.uri);
            setScanning(false);
            processText(result.text);

        } catch (error) {
            console.error('OCR Error:', error);
            Alert.alert('Scan Failed', 'Could not recognize text.');
            resetScan();
        }
    };

    const processText = (text: string) => {
        console.log('Recognized Text:', text);
        const cleanText = text.replace(/\n/g, ' ');

        // Regex Strategies
        const fccMatch = cleanText.match(/FCC\s*ID[:\.\-]?\s*([A-Z0-9]{3,5}-?[A-Z0-9]+)/i);
        const modelMatch = cleanText.match(/(?:Model|M\/N|Modell|Modelo)[:\.\-]?\s*([A-Z0-9\-\/]+)/i);

        let foundDevice: OpenWrtDevice | undefined;

        if (fccMatch) {
            const fccId = fccMatch[1].trim();
            console.log('Found FCC ID:', fccId);

            foundDevice = fuzzySearchFccId(fccId);

            if (foundDevice) {
                setScanResult(`FCC ID: ${fccId}\nMatch: ${foundDevice.brand} ${foundDevice.model}`);
                Alert.alert(
                    'Device Found via FCC ID!',
                    `FCC ID: ${fccId}\nMatch: ${foundDevice.brand} ${foundDevice.model}\nTarget: ${foundDevice.target}`,
                    [
                        { text: 'View Details', onPress: () => { navigation.navigate('Details', { device: foundDevice }); resetScan(); } },
                        { text: 'OK' }
                    ]
                );
            } else {
                setScanResult(`FCC ID: ${fccId}\nNo match found.\n\nFull OCR text:\n${text}`);
            }
            return;
        }

        if (modelMatch) {
            const model = modelMatch[1].trim();
            console.log('Found Model:', model);

            foundDevice = devices.find(d =>
                d.model.toLowerCase().includes(model.toLowerCase()) ||
                model.toLowerCase().includes(d.model.toLowerCase())
            );

            if (foundDevice) {
                setScanResult(`Model: ${model}\nMatch: ${foundDevice.brand} ${foundDevice.model}`);
                Alert.alert(
                    'Device Found!',
                    `Match: ${foundDevice.brand} ${foundDevice.model}\nTarget: ${foundDevice.target}`,
                    [
                        { text: 'View Details', onPress: () => { navigation.navigate('Details', { device: foundDevice }); resetScan(); } },
                        { text: 'OK' }
                    ]
                );
            } else {
                setScanResult(`Model: ${model}\nNo match in database.\n\nFull OCR text:\n${text}`);
            }
        } else {
            setScanResult(`No Model or FCC ID detected.\n\nFull OCR text:\n${text}`);
        }
    };

    return (
        <View style={styles.container}>
            {/* Back button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            {scannedImage && !scanning ? (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: scannedImage }} style={styles.preview} />
                    {scanResult && (
                        <View style={styles.resultOverlay}>
                            <Text style={styles.resultText}>{scanResult}</Text>
                        </View>
                    )}
                    <TouchableOpacity style={styles.scanAgainButton} onPress={resetScan}>
                        <Text style={styles.scanAgainText}>Scan Again</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <CameraView style={styles.camera} ref={cameraRef} facing="back">
                    <View style={styles.overlay}>
                        <View style={styles.guideBox} />
                        <Text style={styles.guideText}>Align label within box</Text>
                    </View>
                </CameraView>
            )}

            {!scannedImage && (
                <View style={styles.controls}>
                    {scanning ? (
                        <ActivityIndicator size="large" color="#fff" />
                    ) : (
                        <TouchableOpacity style={styles.captureButton} onPress={takePictureAndScan}>
                            <View style={styles.captureInner} />
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    camera: {
        flex: 1,
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        color: 'white',
    },
    permissionButton: {
        backgroundColor: '#2196F3',
        padding: 10,
        borderRadius: 5,
        alignSelf: 'center',
    },
    text: {
        color: 'white',
        fontWeight: 'bold',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    guideBox: {
        width: 280,
        height: 150,
        borderWidth: 2,
        borderColor: '#00ff00',
        backgroundColor: 'transparent',
    },
    guideText: {
        color: 'white',
        marginTop: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 5,
    },
    controls: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: 'black',
    },
    previewContainer: {
        flex: 1,
    },
    preview: {
        flex: 1,
        resizeMode: 'contain',
    },
    resultOverlay: {
        position: 'absolute',
        bottom: 80,
        left: 16,
        right: 16,
        backgroundColor: 'rgba(0,0,0,0.75)',
        borderRadius: 8,
        padding: 12,
        maxHeight: 200,
    },
    resultText: {
        color: 'white',
        fontSize: 13,
    },
    scanAgainButton: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        backgroundColor: '#2196F3',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    scanAgainText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 16,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    backText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
