'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itSupportService } from '@/services';
import { ITSupport, Collection } from '@/lib/core/models';
import { FirestoreClientHelper } from '@/lib/firebase/client/firestore-client.helper';

// Query keys
export const itSupportQueryKeys = {
  configuration: ['itSupport', 'configuration'] as const,
  itSupport: (id: string) => ['itSupport', id] as const
};

// Hook to fetch IT support configuration
export const useITSupportConfigurationQuery = () =>
  useQuery({
    queryKey: itSupportQueryKeys.configuration,
    queryFn: () => itSupportService.getITSupportConfiguration(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000 // 30 minutes (formerly cacheTime)
  });

// Hook to fetch IT support data
export const useITSupportQuery = (itSupportId: string) =>
  useQuery({
    queryKey: itSupportQueryKeys.itSupport(itSupportId),
    queryFn: () => FirestoreClientHelper.getItemById<ITSupport>(Collection.USERS, itSupportId),
    enabled: !!itSupportId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

// Hook to update IT support specializations
export const useUpdateITSupportSpecializations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itSupportId, specializations }: { itSupportId: string; specializations: string[] }) =>
      itSupportService.updateITSupportSpecializations(itSupportId, specializations),

    onSuccess: (_, { itSupportId }) => {
      // Invalidate and refetch IT support data
      queryClient.invalidateQueries({ queryKey: itSupportQueryKeys.itSupport(itSupportId) });
    }
  });
};

// Hook to update IT support profile
export const useUpdateITSupportProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itSupportId, data }: { itSupportId: string; data: Partial<ITSupport> }) =>
      FirestoreClientHelper.updateDocument(Collection.USERS, itSupportId, data),

    onSuccess: (_, { itSupportId }) => {
      // Invalidate and refetch IT support data
      queryClient.invalidateQueries({ queryKey: itSupportQueryKeys.itSupport(itSupportId) });
    }
  });
};
