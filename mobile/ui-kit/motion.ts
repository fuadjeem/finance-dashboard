import { Easing, withTiming, withSpring } from 'react-native-reanimated';

export const motion = {
    // Screen transition: Slide from right (standard iOS style)
    screenTransition: {
        duration: 300,
        easing: Easing.out(Easing.poly(4)),
    },

    // List item insert: fade + translateY(8px), 200ms ease-out
    listItemInsert: () => {
        'worklet';
        return {
            duration: 200,
            easing: Easing.out(Easing.quad),
            transform: [{ translateY: 8 }],
            opacity: 0,
        };
    },

    // List item delete: fade out + height collapse, 150ms
    listItemDelete: () => {
        'worklet';
        return {
            duration: 150,
            easing: Easing.inOut(Easing.quad),
        };
    },

    // Button press: scale(0.97), 80ms
    buttonPressConfig: {
        duration: 80,
        easing: Easing.out(Easing.quad),
    },
    buttonScaleDown: 0.97,

    // Toast enter: slide up from bottom, 250ms spring
    toastSpringConfig: {
        damping: 15,
        stiffness: 150,
        mass: 1,
    },

    // Skeleton shimmer: 1.2s loop
    skeletonShimmerDuration: 1200,
};

export const withButtonScale = (pressed: boolean) => {
    'worklet';
    return withTiming(pressed ? motion.buttonScaleDown : 1, motion.buttonPressConfig);
};
