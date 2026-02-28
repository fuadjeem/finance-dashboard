import { Tabs } from 'expo-router';
import { Home, List, Settings } from 'lucide-react-native';
import { tokens } from '../../ui-kit/tokens';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: tokens.colors.brand.primary,
                tabBarInactiveTintColor: tokens.colors.text.disabled,
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: '#e5e7eb',
                    height: 60,
                    paddingBottom: tokens.spacing.sm,
                    paddingTop: tokens.spacing.sm,
                },
                headerStyle: {
                    backgroundColor: tokens.colors.bg.surface,
                    shadowColor: 'transparent',
                    elevation: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f3f4f6',
                },
                headerTitleStyle: {
                    fontFamily: tokens.typography.fontFamily,
                    fontSize: tokens.typography.h3.fontSize,
                    fontWeight: tokens.typography.h3.fontWeight,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color }) => <Home size={24} color={color as string} />,
                }}
            />
            <Tabs.Screen
                name="transactions"
                options={{
                    title: 'Transactions',
                    tabBarIcon: ({ color }) => <List size={24} color={color as string} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => <Settings size={24} color={color as string} />,
                }}
            />
        </Tabs>
    );
}
