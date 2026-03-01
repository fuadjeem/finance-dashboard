import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, StyleSheet } from 'react-native';
import { tokens } from '../tokens';

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: ViewStyle;
}

export const Skeleton = ({
    width = '100%',
    height = 20,
    borderRadius = tokens.radii.sm,
    style,
}: SkeletonProps) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 0.7, duration: 500, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.3, duration: 500, useNativeDriver: true }),
            ])
        ).start();
    }, [opacity]);

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width: width as any,
                    height: height as any,
                    borderRadius,
                    opacity,
                },
                style,
            ]}
        />
    );
};

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: tokens.colors.text.disabled,
    },
});
