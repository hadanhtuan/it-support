import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  isLoading?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPrevious,
  onNext,
  isLoading = false,
  className
}: PaginationProps): React.JSX.Element {
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalCount);

  // Generate page numbers to show
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i += 1) {
        pages.push(i);
      }
    } else {
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(0, currentPage - halfVisible);
      const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(0, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i += 1) {
        pages.push(i);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return (
      <div className={cn('flex items-center justify-between', className)}>
        <div className='text-sm text-muted-foreground'>
          Showing {totalCount} result{totalCount !== 1 ? 's' : ''}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {/* Results count */}
      <div className='text-sm text-muted-foreground'>
        Showing {startItem}-{endItem} of {totalCount} results
      </div>

      {/* Pagination controls */}
      <div className='flex items-center space-x-2'>
        {/* Previous button */}
        <Button variant='outline' size='sm' onClick={onPrevious} disabled={currentPage === 0 || isLoading}>
          <ChevronLeft className='h-4 w-4' />
          Previous
        </Button>

        {/* Page numbers */}
        <div className='flex items-center space-x-1'>
          {getPageNumbers().map((pageNum) => (
            <Button
              key={pageNum}
              variant={pageNum === currentPage ? 'default' : 'outline'}
              size='sm'
              onClick={() => onPageChange(pageNum)}
              disabled={isLoading}
              className='min-w-[2.5rem]'
            >
              {pageNum + 1}
            </Button>
          ))}
        </div>

        {/* Next button */}
        <Button variant='outline' size='sm' onClick={onNext} disabled={currentPage >= totalPages - 1 || isLoading}>
          Next
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
