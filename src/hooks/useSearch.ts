import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';

export function useSearch(query: string) {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        return { products: [], categories: [] };
      }

      const searchTerm = `%${debouncedQuery}%`;

      // Search products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_visible', true)
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},tags.cs.{${debouncedQuery}}`)
        .limit(10);

      if (productsError) throw productsError;

      // Search categories
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .ilike('name', searchTerm)
        .limit(5);

      if (categoriesError) throw categoriesError;

      return {
        products: products as unknown as (Product & { category: Category | null })[],
        categories: categories as Category[],
      };
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSearchSuggestions(query: string) {
  const debouncedQuery = useDebounce(query, 150);

  return useQuery({
    queryKey: ['search-suggestions', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        return [];
      }

      const { data, error } = await supabase
        .from('products')
        .select('name, slug')
        .eq('is_visible', true)
        .ilike('name', `%${debouncedQuery}%`)
        .limit(5);

      if (error) throw error;
      return data as { name: string; slug: string }[];
    },
    enabled: debouncedQuery.length >= 2,
  });
}