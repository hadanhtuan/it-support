'use client';

import React from 'react';
import { useLoading } from '@/lib/context/loading.context';
import { LoadingOverlay } from '@/components/ui/loading';

export const GlobalLoadingWrapper: React.FC = () => {
  const { isLoading, message } = useLoading();

  return (
    <LoadingOverlay
      isVisible={isLoading}
      message={message}
      backdrop="blur"
    />
  );
};
