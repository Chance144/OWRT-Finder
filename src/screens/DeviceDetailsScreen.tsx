import React from 'react';
import { View, ScrollView, StyleSheet, Linking } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button, List, Divider } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { OpenWrtDevice } from '../types/device';

export default function DeviceDetailsScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { device } = route.params as { device: OpenWrtDevice };

    const openLink = (url: string) => {
        if (url) {
            Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
        }
    };

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title={`${device.brand} ${device.model}`} />
            </Appbar.Header>
            <ScrollView contentContainerStyle={styles.content}>
                <Card style={styles.card}>
                    <Card.Content>
                        <Title>System Specs</Title>
                        <Paragraph>CPU: {device.cpu} {device.cpumhz} MHz</Paragraph>
                        <Paragraph>RAM: {device.rammb} MB</Paragraph>
                        <Paragraph>Flash: {device.flashmb} MB</Paragraph>
                        <Paragraph>Target: {device.target} / {device.subtarget}</Paragraph>
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Content>
                        <Title>Support Status</Title>
                        <Paragraph>Current Release: {device.supportedcurrentrel}</Paragraph>
                    </Card.Content>
                </Card>

                {/* Firmware Actions */}
                <View style={styles.actions}>
                    {device.firmwareopenwrtinstallurl ? (
                        <Button
                            mode="contained"
                            icon="download"
                            onPress={() => openLink(device.firmwareopenwrtinstallurl)}
                            style={styles.button}
                        >
                            Factory Install
                        </Button>
                    ) : null}

                    {device.firmwareopenwrtupgradeurl ? (
                        <Button
                            mode="outlined"
                            icon="update"
                            onPress={() => openLink(device.firmwareopenwrtupgradeurl)}
                            style={styles.button}
                        >
                            Sysupgrade
                        </Button>
                    ) : null}
                </View>

                {/* More Details if available */}
                {device.picture ? (
                    <Button mode="text" onPress={() => openLink(device.picture)}>View Device Image</Button>
                ) : null}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eeeff1',
    },
    content: {
        padding: 10,
    },
    card: {
        marginBottom: 10,
    },
    actions: {
        marginVertical: 10,
    },
    button: {
        marginBottom: 10,
    }
});
