export const colors = {
    // Background tiers
    bg: {
        base: '#f6f9fc',
        surface: '#ffffff',
        elevated: '#ffffff',
    },
    // Text tiers
    text: {
        primary: '#111827',
        secondary: '#4b5563',
        disabled: '#9ca3af',
    },
    // Brand
    brand: {
        primary: '#4f46e5',
        secondary: '#6366f1',
    },
    // Semantic
    semantic: {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
    },
    // Chart palette
    chart: [
        '#4f46e5', // Brand primary
        '#10b981', // Success green
        '#f59e0b', // Warning orange
        '#8b5cf6', // Indigo
        '#ec4899', // Pink
    ],
};

export const typography = {
    fontFamily: 'System',
    h1: {
        fontSize: 28,
        fontWeight: '700' as const,
        letterSpacing: -0.5,
    },
    h2: {
        fontSize: 22,
        fontWeight: '600' as const,
    },
    h3: {
        fontSize: 18,
        fontWeight: '600' as const,
    },
    body: {
        fontSize: 15,
        fontWeight: '400' as const,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400' as const,
        color: colors.text.secondary,
    },
    label: {
        fontSize: 13,
        fontWeight: '500' as const,
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
};

export const radii = {
    sm: 6,
    md: 12,
    lg: 16,
    full: 999,
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
};

export const tokens = {
    colors,
    typography,
    spacing,
    radii,
    shadows,
};
