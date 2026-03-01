import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function InitialLayout() {
    const { user, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!user && !inAuthGroup) {
            router.replace('/login');
        } else if (user && inAuthGroup) {
            router.replace('/(tabs)');
        }
    }, [user, loading, segments]);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
                name="category/[id]"
                options={{
                    headerShown: true,
                    headerTitle: 'Category Detail',
                    headerBackTitle: 'Back',
                }}
            />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <InitialLayout />
            </AuthProvider>
        </QueryClientProvider>
    );
}
