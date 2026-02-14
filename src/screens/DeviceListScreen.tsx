import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Appbar, Searchbar, List, ActivityIndicator, Text, FAB, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { fetchOpenWrtDevices, clearCache } from '../services/api';
import { OpenWrtDevice } from '../types/device';

type FilterKey = 'ram64' | 'ram128' | 'flash16' | 'flash32';

const FILTERS: { key: FilterKey; label: string; test: (d: OpenWrtDevice) => boolean }[] = [
    { key: 'ram64', label: '≥64MB RAM', test: (d) => parseFloat(d.rammb) >= 64 },
    { key: 'ram128', label: '≥128MB RAM', test: (d) => parseFloat(d.rammb) >= 128 },
    { key: 'flash16', label: '≥16MB Flash', test: (d) => parseFloat(d.flashmb) >= 16 },
    { key: 'flash32', label: '≥32MB Flash', test: (d) => parseFloat(d.flashmb) >= 32 },
];

export default function DeviceListScreen() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [devices, setDevices] = useState<OpenWrtDevice[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set());
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

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        clearCache();
        try {
            const data = await fetchOpenWrtDevices();
            setDevices(data);
        } catch (e) {
            alert('Failed to refresh data');
        } finally {
            setRefreshing(false);
        }
    }, []);

    const toggleFilter = (key: FilterKey) => {
        setActiveFilters(prev => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };

    const filteredDevices = useMemo(() => {
        let result = devices;

        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            result = result.filter(
                (d) =>
                    d.brand.toLowerCase().includes(lower) ||
                    d.model.toLowerCase().includes(lower) ||
                    d.target.toLowerCase().includes(lower)
            );
        }

        for (const filter of FILTERS) {
            if (activeFilters.has(filter.key)) {
                result = result.filter(filter.test);
            }
        }

        return result;
    }, [devices, searchQuery, activeFilters]);

    const renderItem = ({ item }: { item: OpenWrtDevice }) => (
        <List.Item
            title={`${item.brand} ${item.model}`}
            description={`CPU: ${item.cpu} | Rel: ${item.supportedcurrentrel || 'N/A'}`}
            left={(props) => <List.Icon {...props} icon="router-wireless" />}
            onPress={() => navigation.navigate('Details', { device: item })}
        />
    );

    const deviceCountText = searchQuery || activeFilters.size > 0
        ? `${filteredDevices.length.toLocaleString()} results`
        : `${devices.length.toLocaleString()} devices`;

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
                {!loading && (
                    <Text style={styles.countText}>{deviceCountText}</Text>
                )}
                <View style={styles.filterRow}>
                    {FILTERS.map(f => (
                        <Chip
                            key={f.key}
                            selected={activeFilters.has(f.key)}
                            onPress={() => toggleFilter(f.key)}
                            style={styles.chip}
                            compact
                        >
                            {f.label}
                        </Chip>
                    ))}
                </View>
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
                        refreshing={refreshing}
                        onRefresh={onRefresh}
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
    countText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        marginLeft: 4,
    },
    filterRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        gap: 6,
    },
    chip: {
        marginBottom: 2,
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
