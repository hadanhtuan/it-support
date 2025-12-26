'use client';

import { useState, useEffect } from 'react';
import { Address } from '@/lib/core/models/address.model';

// Import the address data
import rawProvinces from '@/data/address/vn/raw/raw-provinces.json';
import rawWards from '@/data/address/vn/raw/raw-wards.json';

interface UseAddressDataReturn {
  provinces: Address[];
  wards: Address[];
  getWardsByProvince: (provinceId: string, offset?: number, limit?: number) => Address[];
  getWardsByProvinceId: (provinceId: string) => Address[];
  getTotalWardsByProvince: (provinceId: string) => number;
  loadMoreWards: (provinceId: string, offset: number) => Promise<Address[]>;
  isLoading: boolean;
}

export const useAddressData = (): UseAddressDataReturn => {
  const [provinces, setProvinces] = useState<Address[]>([]);
  const [wards, setWards] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAddressData = async (): Promise<void> => {
      try {
        setIsLoading(true);

        // Convert raw provinces to Address format
        const provincesData: Address[] = Object.values(rawProvinces).map((province: any) => ({
          id: province.code,
          name: province.name_with_type,
          type: province.type,
          parentId: null
        }));

        // Convert all wards to Address format
        const wardsData: Address[] = Object.values(rawWards).map((ward: any) => ({
          id: ward.code,
          name: ward.name_with_type,
          type: ward.type,
          parentId: ward.parent_code
        }));

        setProvinces(provincesData);
        setWards(wardsData);
      } catch (error) {
        console.error('Error loading address data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAddressData();
  }, []);

  const getWardsByProvince = (provinceId: string, offset = 0, limit = 50): Address[] => {
    try {
      // Filter wards by province and convert to Address format
      const wardsForProvince = Object.values(rawWards)
        .filter((ward: any) => ward.parent_code === provinceId)
        .map((ward: any) => ({
          id: ward.code,
          name: ward.name_with_type,
          type: ward.type,
          parentId: ward.parent_code
        }))
        .slice(offset, offset + limit);

      return wardsForProvince as Address[];
    } catch (error) {
      console.error('Error filtering wards:', error);
      return [];
    }
  };

  const getWardsByProvinceId = (provinceId: string): Address[] => {
    if (!provinceId) return [];
    return wards.filter((ward) => ward.parentId === provinceId);
  };

  const getTotalWardsByProvince = (provinceId: string): number => {
    try {
      return Object.values(rawWards).filter((ward: any) => ward.parent_code === provinceId).length;
    } catch (error) {
      console.error('Error counting wards:', error);
      return 0;
    }
  };

  const loadMoreWards = async (provinceId: string, offset: number): Promise<Address[]> =>
    // Simulate async operation for potential future API calls
    new Promise((resolve) => {
      setTimeout(() => {
        const moreWards = getWardsByProvince(provinceId, offset, 50);
        resolve(moreWards);
      }, 300); // Small delay to simulate network request
    });

  return {
    provinces,
    wards,
    getWardsByProvince,
    getWardsByProvinceId,
    getTotalWardsByProvince,
    loadMoreWards,
    isLoading
  };
};
