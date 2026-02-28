import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { LogOut, User, Bell, Shield } from 'lucide-react-native';
import { tokens } from '../../ui-kit/tokens';
import { useAuth } from '../../hooks/useAuth';
import { ListRow } from '../../ui-kit/components/ListRow';
import { Card } from '../../ui-kit/components/Card';
import { Button } from '../../ui-kit/components/Button';

export default function SettingsScreen() {
    const { user, signOut } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut();
                    }
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.profileSection}>
                    <View style={styles.avatarLarge}>
                        <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
                    </View>
                    <Text style={styles.name}>{user?.name || 'User'}</Text>
                    <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
                </View>

                <Text style={styles.sectionTitle}>Preferences</Text>
                <Card padding={0} style={styles.cardGroup}>
                    <ListRow
                        title="Account"
                        leftIcon={<User size={20} color={tokens.colors.text.secondary as string} />}
                        onPress={() => { }}
                    />
                    <View style={styles.divider} />
                    <ListRow
                        title="Notifications"
                        leftIcon={<Bell size={20} color={tokens.colors.text.secondary as string} />}
                        onPress={() => { }}
                    />
                    <View style={styles.divider} />
                    <ListRow
                        title="Security"
                        leftIcon={<Shield size={20} color={tokens.colors.text.secondary as string} />}
                        onPress={() => { }}
                    />
                </Card>

                <Button
                    label="Log Out"
                    variant="secondary"
                    onPress={handleLogout}
                    style={styles.logoutButton}
                    textStyle={{ color: tokens.colors.semantic.error }}
                />

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: tokens.colors.bg.base,
    },
    scrollContent: {
        padding: tokens.spacing.lg,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: tokens.spacing.xxl,
        marginTop: tokens.spacing.lg,
    },
    avatarLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: tokens.colors.brand.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: tokens.spacing.md,
    },
    avatarText: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: 32,
        fontWeight: '700',
        color: '#ffffff',
    },
    name: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.h2.fontSize,
        fontWeight: tokens.typography.h2.fontWeight,
        color: tokens.colors.text.primary,
    },
    email: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.body.fontSize,
        color: tokens.colors.text.secondary,
        marginTop: 4,
    },
    sectionTitle: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.label.fontSize,
        fontWeight: '600',
        color: tokens.colors.text.secondary,
        textTransform: 'uppercase',
        marginBottom: tokens.spacing.sm,
        marginLeft: tokens.spacing.md,
    },
    cardGroup: {
        marginBottom: tokens.spacing.xxl,
        overflow: 'hidden',
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginLeft: 56, // Align with text past the icon
    },
    logoutButton: {
        borderColor: tokens.colors.semantic.error,
    }
});
