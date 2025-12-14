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
    const cameraRef = useRef<CameraView>(null);
    const navigation = useNavigation<any>();
    const [devices, setDevices] = useState<OpenWrtDevice[]>([]);

    useEffect(() => {
        // Pre-load devices for lookup
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

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
                    <Text style={styles.text}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const takePictureAndScan = async () => {
        if (!cameraRef.current) return;
        setScanning(true);

        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                skipProcessing: true,
            });

            if (!photo?.uri) throw new Error('Failed to capture image');

            setScannedImage(photo.uri);
            const result = await TextRecognition.recognize(photo.uri);
            processText(result.text);

        } catch (error) {
            console.error('OCR Error:', error);
            Alert.alert('Scan Failed', 'Could not recognize text.');
            setScanning(false);
            setScannedImage(null);
        }
    };

    const processText = (text: string) => {
        console.log('Recognized Text:', text);

        // Normalize text
        const cleanText = text.replace(/\n/g, ' ');

        // Regex Strategies
        // 1. FCC ID
        const fccMatch = cleanText.match(/FCC\s*ID[:\.\-]?\s*([A-Z0-9]{3,5}-?[A-Z0-9]+)/i);
        // 2. Model
        const modelMatch = cleanText.match(/(?:Model|M\/N|Modell|Modelo)[:\.\-]?\s*([A-Z0-9\-\/]+)/i);

        let foundDevice: OpenWrtDevice | undefined;

        if (fccMatch) {
            const fccId = fccMatch[1].trim();
            console.log('Found FCC ID:', fccId);
            // Search logic could be expanded here if we had an FCC DB
            // For now, try to fuzzy match in known models? Unlikely to work directly without a mapping.
            // But let's tell the user what we found.
            Alert.alert('FCC ID Found', `ID: ${fccId}\n(FCC ID lookup not yet implemented in local DB)`);
            setScanning(false);
            setScannedImage(null);
            return;
        }

        if (modelMatch) {
            const model = modelMatch[1].trim();
            console.log('Found Model:', model);

            // Fuzzy search in loaded devices
            foundDevice = devices.find(d =>
                d.model.toLowerCase().includes(model.toLowerCase()) ||
                model.toLowerCase().includes(d.model.toLowerCase())
            );

            if (foundDevice) {
                Alert.alert(
                    'Device Found!',
                    `Match: ${foundDevice.brand} ${foundDevice.model}\nTarget: ${foundDevice.target}`,
                    [
                        { text: 'View Details', onPress: () => navigation.navigate('Details', { device: foundDevice }) },
                        { text: 'Scan Again', onPress: () => { setScanning(false); setScannedImage(null); } }
                    ]
                );
            } else {
                Alert.alert('Model Not Found', `Scanned Model: ${model}\nNo direct match in database.`, [
                    { text: 'OK', onPress: () => { setScanning(false); setScannedImage(null); } }
                ]);
            }
        } else {
            Alert.alert('No Info Found', 'Could not detect Model or FCC ID.', [
                { text: 'Try Again', onPress: () => { setScanning(false); setScannedImage(null); } }
            ]);
        }
    };

    return (
        <View style={styles.container}>
            {scannedImage && !scanning ? (
                <Image source={{ uri: scannedImage }} style={styles.preview} />
            ) : (
                <CameraView style={styles.camera} ref={cameraRef} facing="back">
                    <View style={styles.overlay}>
                        <View style={styles.guideBox} />
                        <Text style={styles.guideText}>Align label within box</Text>
                    </View>
                </CameraView>
            )}

            <View style={styles.controls}>
                {scanning ? (
                    <ActivityIndicator size="large" color="#fff" />
                ) : (
                    <TouchableOpacity style={styles.captureButton} onPress={takePictureAndScan}>
                        <View style={styles.captureInner} />
                    </TouchableOpacity>
                )}
            </View>
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
    preview: {
        flex: 1,
        resizeMode: 'contain',
    }
});
