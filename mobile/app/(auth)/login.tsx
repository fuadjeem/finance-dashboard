import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../ui-kit/components/Input';
import { Button } from '../../ui-kit/components/Button';
import { tokens } from '../../ui-kit/tokens';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        try {
            setLoading(true);
            const res = await api.post('/mobile/token', { email, password });

            if (res.data?.token && res.data?.user) {
                await signIn(res.data.token, res.data.user);
                // The Root _layout will automatically redirect to (tabs) upon AuthContext update
            }
        } catch (err: any) {
            Alert.alert('Login failed', err.response?.data?.error || 'Could not verify credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.formContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>FinanceFlow</Text>
                    <Text style={styles.subtitle}>Welcome back</Text>
                </View>

                <Input
                    label="Email"
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />

                <Input
                    label="Password"
                    placeholder="••••••••"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <Button
                    label="Log In"
                    onPress={handleLogin}
                    loading={loading}
                    style={styles.button}
                />

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <Text
                        style={styles.link}
                        onPress={() => router.push('/signup')}
                    >
                        Sign up
                    </Text>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: tokens.colors.bg.base,
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: tokens.spacing.xl,
    },
    header: {
        marginBottom: tokens.spacing.xxl,
        alignItems: 'center',
    },
    title: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: 32,
        fontWeight: '800',
        color: tokens.colors.brand.primary,
        marginBottom: tokens.spacing.xs,
    },
    subtitle: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.h3.fontSize,
        color: tokens.colors.text.secondary,
    },
    button: {
        marginTop: tokens.spacing.lg,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: tokens.spacing.xl,
    },
    footerText: {
        color: tokens.colors.text.secondary,
        fontFamily: tokens.typography.fontFamily,
    },
    link: {
        color: tokens.colors.brand.primary,
        fontWeight: '600',
        fontFamily: tokens.typography.fontFamily,
    },
});
