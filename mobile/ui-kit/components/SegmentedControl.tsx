import React, { useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent, Animated } from 'react-native';
import { tokens } from '../tokens';

interface SegmentedControlProps {
    options: string[];
    selectedIndex: number;
    onChange: (index: number) => void;
    style?: object;
}

export const SegmentedControl = ({ options, selectedIndex, onChange, style }: SegmentedControlProps) => {
    const [containerWidth, setContainerWidth] = useState(0);
    const translateX = useRef(new Animated.Value(0)).current;

    const segmentWidth = containerWidth / options.length;

    React.useEffect(() => {
        if (segmentWidth > 0) {
            Animated.timing(translateX, {
                toValue: selectedIndex * segmentWidth,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [selectedIndex, segmentWidth]);

    const onLayout = (e: LayoutChangeEvent) => {
        setContainerWidth(e.nativeEvent.layout.width);
    };

    return (
        <View style={[styles.container, style]} onLayout={onLayout}>
            {containerWidth > 0 && (
                <Animated.View
                    style={[
                        styles.indicator,
                        { width: segmentWidth, transform: [{ translateX }] },
                    ]}
                />
            )}
            {options.map((option, idx) => {
                const isActive = selectedIndex === idx;
                return (
                    <Pressable
                        key={option}
                        style={styles.segment}
                        onPress={() => onChange(idx)}
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
