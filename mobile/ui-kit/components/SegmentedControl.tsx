import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { tokens } from '../tokens';

interface SegmentedControlProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
}

export const SegmentedControl = ({ options, value, onChange }: SegmentedControlProps) => {
    const [containerWidth, setContainerWidth] = useState(0);
    const selectedIndex = options.indexOf(value);
    const translateX = useSharedValue(0);

    const segmentWidth = containerWidth / options.length;

    useEffect(() => {
        if (segmentWidth > 0) {
            translateX.value = withTiming(selectedIndex * segmentWidth, { duration: 250 });
        }
    }, [selectedIndex, segmentWidth]);

    const animatedIndicatorStyle = useAnimatedStyle(() => {
        return {
            width: segmentWidth,
            transform: [{ translateX: translateX.value }],
        };
    });

    const onLayout = (e: LayoutChangeEvent) => {
        setContainerWidth(e.nativeEvent.layout.width);
    };

    return (
        <View style={styles.container} onLayout={onLayout}>
            {containerWidth > 0 && (
                <Animated.View style={[styles.indicator, animatedIndicatorStyle]} />
            )}
            {options.map((option) => {
                const isActive = value === option;
                return (
                    <Pressable
                        key={option}
                        style={styles.segment}
                        onPress={() => onChange(option)}
                    >
                        <Text style={[styles.text, isActive && styles.textActive]}>
                            {option}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: tokens.colors.bg.base,
        borderRadius: tokens.radii.sm,
        padding: 3,
        position: 'relative',
        height: 36,
    },
    indicator: {
        position: 'absolute',
        top: 3,
        bottom: 3,
        left: 3,
        backgroundColor: tokens.colors.bg.surface,
        borderRadius: tokens.radii.sm - 2,
        ...tokens.shadows.sm,
    },
    segment: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    text: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.label.fontSize,
        fontWeight: '500',
        color: tokens.colors.text.secondary,
    },
    textActive: {
        color: tokens.colors.text.primary,
        fontWeight: '600',
    },
});
