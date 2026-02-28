import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

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
