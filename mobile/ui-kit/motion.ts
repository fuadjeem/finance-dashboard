/**
 * Motion constants for the ui-kit.
 * Replaced reanimated-specific values with React Native Animated compatible values.
 */

export const motion = {
    screenTransition: { duration: 300 },
    listItemInsert: { duration: 200 },
    listItemDelete: { duration: 150 },
    buttonPressConfig: { duration: 80, useNativeDriver: true },
    buttonScaleDown: 0.97,
    toastSpringConfig: { damping: 15, stiffness: 150, mass: 1 },
    skeletonShimmerDuration: 1200,
};
