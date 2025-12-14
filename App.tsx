import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DeviceListScreen from './src/screens/DeviceListScreen';
import DeviceDetailsScreen from './src/screens/DeviceDetailsScreen';
import ScanScreen from './src/screens/ScanScreen';

const Stack = createStackNavigator();

export default function App() {
    return (
        <SafeAreaProvider>
            <PaperProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="Home" component={DeviceListScreen} />
                        <Stack.Screen name="Details" component={DeviceDetailsScreen} />
                        <Stack.Screen name="Scan" component={ScanScreen} />
                    </Stack.Navigator>
                </NavigationContainer>
            </PaperProvider>
        </SafeAreaProvider>
    );
}
