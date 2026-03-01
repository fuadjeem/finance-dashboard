import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

// ─── Existing hooks ───────────────────────────────────────────────────────────

export const useTransactions = (month?: string) => {
    return useQuery({
        queryKey: ['transactions', month],
        queryFn: async () => {
            const endpoint = month ? `/transactions?month=${month}` : '/transactions';
            const { data } = await api.get(endpoint);
            return data;
        },
    });
};

export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await api.get('/categories');
            return data;
        },
    });
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

/** GET /api/transactions/summary?month=YYYY-MM&months=N */
export const useDashboardSummary = (month: string, months: number = 4) => {
    return useQuery({
        queryKey: ['dashboard-summary', month, months],
        queryFn: async () => {
            const { data } = await api.get(`/transactions/summary?month=${month}&months=${months}`);
            return data as {
                summary: { month: string; income: number; costs: number }[];
                analytics: {
                    netIncome: number;
                    totalIncome: number;
                    totalCosts: number;
                    avgDailySpend: number;
                    currentMonth: string;
                } | null;
            };
        },
    });
};

/** GET /api/categories/spending?month=YYYY-MM */
export const useCategorySpending = (month: string) => {
    return useQuery({
        queryKey: ['category-spending', month],
        queryFn: async () => {
            const { data } = await api.get(`/categories/spending?month=${month}`);
            return data as { id: string; name: string; type: string; totalCents: number }[];
        },
    });
};

// ─── Category Detail ─────────────────────────────────────────────────────────

/** Transactions filtered by categoryId + month date range */
export const useCategoryTransactions = (categoryId: string, month: string) => {
    return useQuery({
        queryKey: ['category-transactions', categoryId, month],
        queryFn: async () => {
            const [y, m] = month.split('-').map(Number);
            const startDate = `${month}-01`;
            const endDate = `${y}-${String(m).padStart(2, '0')}-${new Date(y, m, 0).getDate()}`;
            const { data } = await api.get(
                `/transactions?categoryId=${categoryId}&startDate=${startDate}&endDate=${endDate}&limit=200`
            );
            return data as {
                transactions: {
                    id: string;
                    type: string;
                    amountCents: number;
                    date: string;
                    note: string;
                    excluded: boolean;
                    categoryId: string;
                    category: { name: string };
                }[];
            };
        },
    });
};

/** GET /api/categories — all categories */
export const useAllCategories = () => {
    return useQuery({
        queryKey: ['all-categories'],
        queryFn: async () => {
            const { data } = await api.get('/categories');
            return data as { id: string; name: string; type: string }[];
        },
    });
};

/** GET /api/categories?type=COST|INCOME */
export const useCategoriesByType = (type: 'COST' | 'INCOME') => {
    return useQuery({
        queryKey: ['categories-by-type', type],
        queryFn: async () => {
            const { data } = await api.get(`/categories?type=${type}`);
            return data as { id: string; name: string; type: string }[];
        },
    });
};

// ─── Transactions List ────────────────────────────────────────────────────────

export const useAllTransactions = (params: {
    filterType?: string;
    search?: string;
    offset?: number;
    limit?: number;
}) => {
    const { filterType = '', search = '', offset = 0, limit = 20 } = params;
    return useQuery({
        queryKey: ['all-transactions', filterType, search, offset],
        queryFn: async () => {
            const q = new URLSearchParams();
            if (filterType) q.set('type', filterType);
            if (search) q.set('search', search);
            q.set('limit', String(limit));
            q.set('offset', String(offset));
            const { data } = await api.get(`/transactions?${q.toString()}`);
            return data as {
                transactions: {
                    id: string;
                    type: string;
                    amountCents: number;
                    categoryId: string;
                    date: string;
                    note: string;
                    category: { name: string };
                }[];
                total: number;
            };
        },
    });
};

// ─── User Currency ────────────────────────────────────────────────────────────

export const useUserCurrency = () => {
    return useQuery({
        queryKey: ['user-currency'],
        queryFn: async () => {
            const { data } = await api.get('/user/currency');
            return (data.currency as string) || 'USD';
        },
    });
};

export const useUpdateCurrency = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (currency: string) => {
            await api.put('/user/currency', { currency });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-currency'] });
        },
    });
};

// ─── Transaction Mutations ────────────────────────────────────────────────────

export const useCreateTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: {
            type: string;
            categoryId: string;
            amountCents: number;
            date: string;
            note?: string;
        }) => {
            const { data } = await api.post('/transactions', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-transactions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            queryClient.invalidateQueries({ queryKey: ['category-spending'] });
            queryClient.invalidateQueries({ queryKey: ['category-transactions'] });
        },
    });
};

export const useUpdateTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
            const { data } = await api.put(`/transactions/${id}`, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-transactions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            queryClient.invalidateQueries({ queryKey: ['category-spending'] });
            queryClient.invalidateQueries({ queryKey: ['category-transactions'] });
        },
    });
};

export const useDeleteTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/transactions/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-transactions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            queryClient.invalidateQueries({ queryKey: ['category-spending'] });
        },
    });
};

// ─── Category Mutations ───────────────────────────────────────────────────────

export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { name: string; type: string }) => {
            const { data } = await api.post('/categories', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories-by-type'] });
            queryClient.invalidateQueries({ queryKey: ['all-categories'] });
        },
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, name }: { id: string; name: string }) => {
            const { data } = await api.put(`/categories/${id}`, { name });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories-by-type'] });
            queryClient.invalidateQueries({ queryKey: ['all-categories'] });
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/categories/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories-by-type'] });
            queryClient.invalidateQueries({ queryKey: ['all-categories'] });
        },
    });
};
