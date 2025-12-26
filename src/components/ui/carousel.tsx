'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CarouselProps {
  children: React.ReactNode[];
  className?: string;
  itemClassName?: string;
  showDots?: boolean;
  showArrows?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  itemsPerView?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function Carousel({
  children,
  className = '',
  itemClassName = '',
  showDots = true,
  showArrows = true,
  autoPlay = false,
  autoPlayInterval = 3000,
  itemsPerView = { default: 1, md: 2, lg: 3 }
}: CarouselProps): React.JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerViewCurrent, setItemsPerViewCurrent] = useState(itemsPerView.default);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout>();

  // Calculate max index based on current items per view
  const maxIndex = Math.max(0, children.length - itemsPerViewCurrent);

  // Update items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = (): void => {
      const width = window.innerWidth;
      if (width >= 1280 && itemsPerView.xl) {
        setItemsPerViewCurrent(itemsPerView.xl);
      } else if (width >= 1024 && itemsPerView.lg) {
        setItemsPerViewCurrent(itemsPerView.lg);
      } else if (width >= 768 && itemsPerView.md) {
        setItemsPerViewCurrent(itemsPerView.md);
      } else if (width >= 640 && itemsPerView.sm) {
        setItemsPerViewCurrent(itemsPerView.sm);
      } else {
        setItemsPerViewCurrent(itemsPerView.default);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return (): void => window.removeEventListener('resize', updateItemsPerView);
  }, [itemsPerView]);

  // Auto play functionality
  useEffect(() => {
    if (!autoPlay || children.length <= itemsPerViewCurrent) {
      return;
    }

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, autoPlayInterval);

    return (): void => {
      if (!autoPlayRef.current) {
        return;
      }
      clearInterval(autoPlayRef.current);
    };
  }, [autoPlay, autoPlayInterval, children.length, itemsPerViewCurrent, maxIndex]);

  // Reset current index if it exceeds max
  useEffect(() => {
    if (currentIndex <= maxIndex) {
      return;
    }
    setCurrentIndex(maxIndex);
  }, [currentIndex, maxIndex]);

  const goToSlide = (index: number): void => {
    const clampedIndex = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex(clampedIndex);
  };

  const goToPrevious = (): void => {
    goToSlide(currentIndex - 1);
  };

  const goToNext = (): void => {
    goToSlide(currentIndex + 1);
  };

  const handleMouseEnter = (): void => {
    if (!autoPlayRef.current) {
      return;
    }
    clearInterval(autoPlayRef.current);
  };

  const handleMouseLeave = (): void => {
    if (!autoPlay || children.length <= itemsPerViewCurrent) {
      return;
    }
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, autoPlayInterval);
  };

  // Don't show carousel if there are fewer items than itemsPerView
  if (children.length <= itemsPerViewCurrent) {
    return (
      <div className={cn('grid gap-4', className)}>
        {children.map((child, index) => (
          <div key={index} className={cn('w-full', itemClassName)}>
            {child}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {/* Carousel Container */}
      <div className='overflow-hidden rounded-lg' ref={containerRef}>
        <div
          className='flex transition-transform duration-300 ease-in-out'
          style={{
            transform: `translateX(-${(currentIndex * 100) / itemsPerViewCurrent}%)`,
            width: `${(children.length * 100) / itemsPerViewCurrent}%`
          }}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className={cn('flex-shrink-0', itemClassName)}
              style={{ width: `${100 / children.length}%` }}
            >
              <div className='px-2'>{child}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && (
        <>
          <Button
            variant='outline'
            size='icon'
            className={cn(
              'absolute left-2 top-1/2 -translate-y-1/2 z-10',
              'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm',
              'hover:bg-white dark:hover:bg-gray-900',
              'shadow-lg border-white/60 dark:border-gray-800/60',
              currentIndex === 0 && 'opacity-50 cursor-not-allowed'
            )}
            onClick={goToPrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 z-10',
              'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm',
              'hover:bg-white dark:hover:bg-gray-900',
              'shadow-lg border-white/60 dark:border-gray-800/60',
              currentIndex >= maxIndex && 'opacity-50 cursor-not-allowed'
            )}
            onClick={goToNext}
            disabled={currentIndex >= maxIndex}
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && maxIndex > 0 && (
        <div className='flex justify-center mt-4 gap-2'>
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-200',
                index === currentIndex
                  ? 'bg-primary scale-125'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              )}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
