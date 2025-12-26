'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, ChevronDown, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Address } from '@/lib/core/models/address.model';

interface ProvinceWardSelectorProps {
  provinceName?: string;
  wardName?: string;
  onProvinceChange: (provinceName: string, provinceId: string) => void;
  onWardChange: (wardName: string, wardId: string) => void;
  provinces: Address[];
  getWardsByProvince: (provinceId: string, offset?: number, limit?: number) => Address[];
  onLoadMoreWards?: (provinceId: string, offset: number) => Promise<Address[]>;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  provinceLabel?: string;
  wardLabel?: string;
  provincePlaceholder?: string;
  wardPlaceholder?: string;
  isLoadingWards?: boolean;
}

const ProvinceWardSelector: React.FC<ProvinceWardSelectorProps> = ({
  provinceName,
  wardName,
  onProvinceChange,
  onWardChange,
  provinces,
  getWardsByProvince,
  disabled = false,
  required = false,
  className,
  provinceLabel = 'Province',
  wardLabel = 'Ward',
  provincePlaceholder = 'Select province',
  wardPlaceholder = 'Select ward',
  onLoadMoreWards,
  isLoadingWards = false
}) => {
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [wardOpen, setWardOpen] = useState(false);
  const [provinceSearch, setProvinceSearch] = useState('');
  const [wardSearch, setWardSearch] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<Address | null>(null);
  const [isLoadingMoreWards, setIsLoadingMoreWards] = useState(false);
  const [displayedWards, setDisplayedWards] = useState<Address[]>([]);
  const [wardOffset, setWardOffset] = useState(0);
  const [hasMoreWards, setHasMoreWards] = useState(true);

  const wardListRef = useRef<HTMLDivElement>(null);
  const WARD_PAGE_SIZE = 50;

  // Filter provinces based on search
  const filteredProvinces = provinces.filter((province) =>
    province.name.toLowerCase().includes(provinceSearch.toLowerCase())
  );

  // Filter displayed wards based on search
  const filteredWards = displayedWards.filter((ward) => ward.name.toLowerCase().includes(wardSearch.toLowerCase()));

  // Initialize selected province when provinceName changes
  useEffect(() => {
    if (provinceName && provinces.length > 0) {
      const province = provinces.find((p) => p.name === provinceName);
      setSelectedProvince(province || null);
    } else {
      setSelectedProvince(null);
    }
  }, [provinceName, provinces]);

  // Load initial wards when selected province changes
  useEffect(() => {
    if (selectedProvince) {
      const initialWards = getWardsByProvince(selectedProvince.id, 0, WARD_PAGE_SIZE);
      setDisplayedWards(initialWards);
      setWardOffset(initialWards.length);
      setHasMoreWards(initialWards.length === WARD_PAGE_SIZE);
    } else {
      setDisplayedWards([]);
      setWardOffset(0);
      setHasMoreWards(false);
    }
  }, [selectedProvince, getWardsByProvince]);

  // Load more wards when scrolling
  const loadMoreWards = useCallback(async (): Promise<void> => {
    if (!selectedProvince || !onLoadMoreWards || isLoadingMoreWards || !hasMoreWards) {
      return;
    }

    setIsLoadingMoreWards(true);
    try {
      const moreWards = await onLoadMoreWards(selectedProvince.id, wardOffset);
      if (moreWards.length > 0) {
        setDisplayedWards((prev) => [...prev, ...moreWards]);
        setWardOffset((prev) => prev + moreWards.length);
        setHasMoreWards(moreWards.length === WARD_PAGE_SIZE);
      } else {
        setHasMoreWards(false);
      }
    } catch (error) {
      console.error('Error loading more wards:', error);
      setHasMoreWards(false);
    } finally {
      setIsLoadingMoreWards(false);
    }
  }, [selectedProvince, onLoadMoreWards, isLoadingMoreWards, wardOffset, hasMoreWards]);

  // Handle scroll in ward list
  const handleWardScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>): void => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

      // Load more when scrolled near bottom (within 50px for better UX)
      if (scrollHeight - scrollTop - clientHeight < 50 && hasMoreWards && !isLoadingMoreWards) {
        loadMoreWards();
      }
    },
    [hasMoreWards, isLoadingMoreWards, loadMoreWards]
  );

  const handleProvinceSelect = (province: Address): void => {
    setSelectedProvince(province);
    onProvinceChange(province.name, province.id);
    setProvinceOpen(false);
    setProvinceSearch('');

    // Reset ward selection and state - wards will be loaded by useEffect
    onWardChange('', '');
    setWardSearch('');
  };

  const handleWardSelect = (ward: Address): void => {
    onWardChange(ward.name, ward.id);
    setWardOpen(false);
    setWardSearch('');
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Province Selector */}
      <div className='space-y-2'>
        <Label htmlFor='province'>
          {provinceLabel} {required && '*'}
        </Label>
        <Popover open={provinceOpen} onOpenChange={setProvinceOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              role='combobox'
              aria-expanded={provinceOpen}
              className='w-full justify-between'
              disabled={disabled}
            >
              {provinceName || provincePlaceholder}
              <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-full p-0' align='start'>
            <div className='p-2'>
              <div className='flex items-center border rounded px-3 py-2'>
                <Search className='mr-2 h-4 w-4 shrink-0 opacity-50' />
                <Input
                  placeholder='Search provinces...'
                  value={provinceSearch}
                  onChange={(e) => setProvinceSearch(e.target.value)}
                  className='border-0 focus:ring-0 focus:outline-none p-0'
                />
              </div>
              <div className='max-h-60 overflow-y-auto mt-2'>
                {filteredProvinces.length === 0 ? (
                  <div className='py-6 text-center text-sm text-muted-foreground'>No province found.</div>
                ) : (
                  <div className='space-y-1'>
                    {filteredProvinces.map((province) => (
                      <div
                        key={province.id}
                        onClick={() => handleProvinceSelect(province)}
                        className='cursor-pointer px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground'
                      >
                        {province.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Ward Selector */}
      <div className='space-y-2'>
        <Label htmlFor='ward'>
          {wardLabel} {required && '*'}
        </Label>
        <Popover open={wardOpen} onOpenChange={setWardOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              role='combobox'
              aria-expanded={wardOpen}
              className='w-full justify-between'
              disabled={disabled || !selectedProvince || isLoadingWards}
            >
              {isLoadingWards ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Loading wards...
                </>
              ) : (
                <>
                  {wardName || wardPlaceholder}
                  <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-full p-0' align='start'>
            <div className='p-2'>
              <div className='flex items-center border rounded px-3 py-2'>
                <Search className='mr-2 h-4 w-4 shrink-0 opacity-50' />
                <Input
                  placeholder='Search wards...'
                  value={wardSearch}
                  onChange={(e) => setWardSearch(e.target.value)}
                  className='border-0 focus:ring-0 focus:outline-none p-0'
                />
              </div>
              <div className='max-h-60 overflow-y-auto mt-2' ref={wardListRef} onScroll={handleWardScroll}>
                {filteredWards.length === 0 ? (
                  <div className='py-6 text-center text-sm text-muted-foreground'>
                    {selectedProvince ? 'No ward found.' : 'Please select a province first.'}
                  </div>
                ) : (
                  <div className='space-y-1'>
                    {filteredWards.map((ward) => (
                      <div
                        key={ward.id}
                        onClick={() => handleWardSelect(ward)}
                        className='cursor-pointer px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground'
                      >
                        {ward.name}
                      </div>
                    ))}
                    {isLoadingMoreWards && (
                      <div className='flex justify-center py-2'>
                        <Loader2 className='h-4 w-4 animate-spin' />
                        <span className='ml-2 text-sm text-muted-foreground'>Loading more wards...</span>
                      </div>
                    )}
                    {!hasMoreWards && displayedWards.length > 0 && filteredWards.length === displayedWards.length && (
                      <div className='py-2 text-center text-sm text-muted-foreground'>No more wards to load</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default ProvinceWardSelector;
