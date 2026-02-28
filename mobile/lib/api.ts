import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://finance.jprojects.cc';

export const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to attach bearer token
api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor to catch 401s globally
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Clear token and auto-redirect to login
            await SecureStore.deleteItemAsync('token');
            // We will handle the navigation reload state in the root _layout.tsx based on the query state
        }
        return Promise.reject(error);
    }
);
