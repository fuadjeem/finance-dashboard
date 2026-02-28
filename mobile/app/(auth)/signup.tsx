import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../ui-kit/components/Input';
import { Button } from '../../ui-kit/components/Button';
import { tokens } from '../../ui-kit/tokens';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

export default function SignupScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const router = useRouter();

    const handleSignup = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters');
            return;
        }

        try {
            setLoading(true);
            // Create user via existing Next.js registration endpoint
            await api.post('/auth/signup', { name, email, password });

            // Immediately log them in using the mobile-only token route
            const loginRes = await api.post('/mobile/token', { email, password });

            if (loginRes.data?.token && loginRes.data?.user) {
                await signIn(loginRes.data.token, loginRes.data.user);
            }
        } catch (err: any) {
            Alert.alert('Signup failed', err.response?.data?.error || 'Could not create account');
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
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Start tracking your finances today</Text>
                </View>

                <Input
                    label="Name"
                    placeholder="Jane Doe"
                    autoCapitalize="words"
                    value={name}
                    onChangeText={setName}
                />

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
                    placeholder="Min. 8 characters"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <Button
                    label="Sign Up"
                    onPress={handleSignup}
                    loading={loading}
                    style={styles.button}
                />

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <Text
                        style={styles.link}
                        onPress={() => router.replace('/login')}
                    >
                        Log in
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
        fontSize: 28,
        fontWeight: '800',
        color: tokens.colors.text.primary,
        marginBottom: tokens.spacing.xs,
    },
    subtitle: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.body.fontSize,
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
