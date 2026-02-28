import React, { useEffect } from 'react';
import { StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerEventPayload, HandlerStateChangeEvent } from 'react-native-gesture-handler';
import { tokens } from '../tokens';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = SCREEN_HEIGHT;

interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    snapPoints?: string[]; // e.g. ['50%', '90%']
}

export const BottomSheet = ({ visible, onClose, children, snapPoints = ['50%'] }: BottomSheetProps) => {
    const translateY = useSharedValue(MAX_TRANSLATE_Y);
    const opacity = useSharedValue(0);

    const defaultHeight = (parseFloat(snapPoints[0]) / 100) * SCREEN_HEIGHT;

    useEffect(() => {
        if (visible) {
            opacity.value = withTiming(1, { duration: 300 });
            translateY.value = withSpring(SCREEN_HEIGHT - defaultHeight, {
                damping: 15,
                stiffness: 150,
            });
        } else {
            opacity.value = withTiming(0, { duration: 250 });
            translateY.value = withTiming(MAX_TRANSLATE_Y, { duration: 250 }, (finished) => {
                if (finished) runOnJS(onClose)();
            });
        }
    }, [visible]);

    const closeSheet = () => {
        opacity.value = withTiming(0, { duration: 250 });
        translateY.value = withTiming(MAX_TRANSLATE_Y, { duration: 250 }, (finished) => {
            if (finished) runOnJS(onClose)();
        });
    };

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        pointerEvents: visible ? 'auto' : 'none',
    }));

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    if (!visible) return null;

    return (
        <>
            <Animated.View style={[styles.backdrop, backdropStyle]}>
                <Pressable style={styles.backdropPressable} onPress={closeSheet} />
            </Animated.View>
            <Animated.View style={[styles.sheet, sheetStyle, { height: defaultHeight }]}>
                <PanGestureHandler
                    onGestureEvent={((e: { nativeEvent: PanGestureHandlerEventPayload }) => {
                        if (e.nativeEvent.translationY > 0) {
                            translateY.value = SCREEN_HEIGHT - defaultHeight + e.nativeEvent.translationY;
                        }
                    }) as any}
                    onEnded={((e: any) => {
                        if (e.nativeEvent.translationY > 50 || e.nativeEvent.velocityY > 500) {
                            runOnJS(closeSheet)();
                        } else {
                            translateY.value = withSpring(SCREEN_HEIGHT - defaultHeight);
                        }
                    }) as any}
                >
                    <Animated.View style={styles.handleContainer}>
                        <Animated.View style={styles.handle} />
                    </Animated.View>
                </PanGestureHandler>
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
    backdropPressable: {
        flex: 1,
    },
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
    handleContainer: {
        alignItems: 'center',
        paddingVertical: tokens.spacing.md,
    },
    handle: {
        width: 40,
        height: 5,
        borderRadius: tokens.radii.full,
        backgroundColor: '#d1d5db',
    },
});
