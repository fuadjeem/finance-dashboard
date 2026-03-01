import React, { useEffect, useRef } from 'react';
import { StyleSheet, Pressable, Dimensions, Animated, View } from 'react-native';
import { tokens } from '../tokens';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    snapPoints?: string[];
}

export const BottomSheet = ({ visible, onClose, children, snapPoints = ['50%'] }: BottomSheetProps) => {
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    const defaultHeight = (parseFloat(snapPoints[0]) / 100) * SCREEN_HEIGHT;
    const defaultTranslateY = SCREEN_HEIGHT - defaultHeight;

    const closeSheet = () => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: SCREEN_HEIGHT, duration: 250, useNativeDriver: true }),
        ]).start(onClose);
    };

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.spring(translateY, { toValue: defaultTranslateY, damping: 15, stiffness: 150, useNativeDriver: true }),
            ]).start();
        } else {
            closeSheet();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <>
            <Animated.View style={[styles.backdrop, { opacity }]}>
                <Pressable style={styles.backdropPressable} onPress={closeSheet} />
            </Animated.View>
            <Animated.View style={[styles.sheet, { height: defaultHeight, transform: [{ translateY }] }]}>
                <View style={styles.handleContainer}>
                    <View style={styles.handle} />
                </View>
                {children}
            </Animated.View>
        </>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        zIndex: 100,
    },
    backdropPressable: { flex: 1 },
    sheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        backgroundColor: tokens.colors.bg.surface,
        borderTopLeftRadius: tokens.radii.lg,
        borderTopRightRadius: tokens.radii.lg,
        zIndex: 101,
        paddingHorizontal: tokens.spacing.lg,
        paddingBottom: 40,
    },
    handleContainer: { alignItems: 'center', paddingVertical: tokens.spacing.md },
    handle: { width: 40, height: 5, borderRadius: tokens.radii.full, backgroundColor: '#d1d5db' },
});
