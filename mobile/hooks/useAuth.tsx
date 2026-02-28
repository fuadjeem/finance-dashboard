import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '../lib/api';

interface User {
    id: string;
    name: string;
    email: string;
    currency: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (token: string, userData: User) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signIn: async () => { },
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session token on mount
        const loadSession = async () => {
            try {
                const token = await SecureStore.getItemAsync('token');
                const userDataStr = await SecureStore.getItemAsync('user');

                if (token && userDataStr) {
                    // In a real app we might verify the token validity with the backend here, or just let the first API call fail
                    setUser(JSON.parse(userDataStr));
                }
            } catch (error) {
                console.error('Failed to load session', error);
            } finally {
                setLoading(false);
            }
        };

        loadSession();
    }, []);

    const signIn = async (token: string, userData: User) => {
        try {
            await SecureStore.setItemAsync('token', token);
            await SecureStore.setItemAsync('user', JSON.stringify(userData));
            setUser(userData);
        } catch (error) {
            console.error('Failed to save session', error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await SecureStore.deleteItemAsync('token');
            await SecureStore.deleteItemAsync('user');
            setUser(null);
        } catch (error) {
            console.error('Failed to clear session', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
