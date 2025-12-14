import React, { useEffect, useState, useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Appbar, Searchbar, List, ActivityIndicator, Text, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { fetchOpenWrtDevices } from '../services/api';
import { OpenWrtDevice } from '../types/device';

export default function DeviceListScreen() {
    const [loading, setLoading] = useState(true);
    const [devices, setDevices] = useState<OpenWrtDevice[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigation = useNavigation<any>();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await fetchOpenWrtDevices();
            setDevices(data);
        } catch (e) {
            alert('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const filteredDevices = useMemo(() => {
        if (!searchQuery) return devices;
        const lower = searchQuery.toLowerCase();
        return devices.filter(
            (d) =>
                d.brand.toLowerCase().includes(lower) ||
                d.model.toLowerCase().includes(lower) ||
                d.target.toLowerCase().includes(lower)
        );
    }, [devices, searchQuery]);

    const renderItem = ({ item }: { item: OpenWrtDevice }) => (
        <List.Item
            title={`${item.brand} ${item.model}`}
            description={`CPU: ${item.cpu} | Rel: ${item.supportedcurrentrel || 'N/A'}`}
            left={(props) => <List.Icon {...props} icon="router-wireless" />}
            onPress={() => navigation.navigate('Details', { device: item })}
        />
    );

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.Content title="OpenWrt Hardware" />
            </Appbar.Header>
            <View style={styles.searchContainer}>
                <Searchbar
                    placeholder="Search Brand, Model, Target..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                />
            </View>
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" />
                    <Text style={{ marginTop: 10 }}>Loading OpenWrt Database...</Text>
                </View>
            ) : (
                <>
                    <FlatList
                        data={filteredDevices}
                        keyExtractor={(item, index) => item.deviceid || String(index)}
                        renderItem={renderItem}
                        initialNumToRender={20}
                        maxToRenderPerBatch={50}
                        windowSize={21}
                    />
                    <FAB
                        icon="camera"
                        label="Scan Label"
                        style={styles.fab}
                        onPress={() => navigation.navigate('Scan')}
                    />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    searchContainer: {
        padding: 10,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
