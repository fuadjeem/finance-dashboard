import React, { useEffect } from 'react';
import { ViewStyle, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withSequence,
} from 'react-native-reanimated';
import { tokens } from '../tokens';
import { motion } from '../motion';

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
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.7, { duration: motion.skeletonShimmerDuration / 2 }),
                withTiming(0.3, { duration: motion.skeletonShimmerDuration / 2 })
            ),
            -1,
            true
        );
    }, [opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width: width as any,
                    height: height as any,
                    borderRadius,
                },
                animatedStyle,
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
