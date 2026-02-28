import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
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
            // Redirect to login if not logged in
            router.replace('/login');
        } else if (user && inAuthGroup) {
            // Redirect to dashboard if logged in and trying to view auth screens
            router.replace('/(tabs)');
        }
    }, [user, loading, segments]);

    return <Slot />;
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
