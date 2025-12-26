'use client';

import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import type { Column } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n';

type FilterOperator =
  | 'equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'starts_with'
  | 'ends_with';

type FilterConfig = {
  type: 'text' | 'select' | 'number' | 'date';
  options?: { label: string; value: string }[];
  operators?: FilterOperator[];
};

interface ColumnFilterProps<TData> {
  column: Column<TData, unknown>;
  title: string;
  config: FilterConfig;
}

const defaultOperators: Record<FilterConfig['type'], FilterOperator[]> = {
  text: ['equals', 'contains', 'not_contains', 'starts_with', 'ends_with'],
  select: ['equals'],
  number: ['equals', 'greater_than', 'less_than'],
  date: ['equals', 'greater_than', 'less_than']
};

export function ColumnFilter<TData>({ column, title, config }: ColumnFilterProps<TData>): React.JSX.Element {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [operator, setOperator] = useState<FilterOperator>(config.operators?.[0] || defaultOperators[config.type][0]);
  const [value, setValue] = useState('');

  const operatorLabels: Record<FilterOperator, string> = {
    equals: t('common.equals') || 'Equals',
    contains: t('common.contains') || 'Contains',
    not_contains: t('common.not_contains') || 'Does not contain',
    greater_than: t('common.greater_than') || 'Greater than',
    less_than: t('common.less_than') || 'Less than',
    starts_with: t('common.starts_with') || 'Starts with',
    ends_with: t('common.ends_with') || 'Ends with'
  };

  const availableOperators = config.operators || defaultOperators[config.type];
  const currentFilter = column.getFilterValue() as { operator: FilterOperator; value: string } | undefined;

  const applyFilter = () => {
    if (value.trim()) {
      column.setFilterValue({ operator, value: value.trim() });
    } else {
      column.setFilterValue(undefined);
    }
    setIsOpen(false);
  };

  const clearFilter = () => {
    column.setFilterValue(undefined);
    setValue('');
    setIsOpen(false);
  };

  const hasActiveFilter = !!currentFilter;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='sm' className={`h-8 px-2 ${hasActiveFilter ? 'text-blue-600' : ''}`}>
          <Filter className={`h-4 w-4 mr-1 ${hasActiveFilter ? 'text-blue-600' : ''}`} />
          {title}
          {hasActiveFilter && (
            <Badge variant='secondary' className='ml-2 h-5 px-1 text-xs'>
              1
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80' align='start'>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h4 className='font-medium'>Filter {title}</h4>
            {hasActiveFilter && (
              <Button variant='ghost' size='sm' onClick={clearFilter}>
                <X className='h-4 w-4' />
              </Button>
            )}
          </div>

          <div className='space-y-3'>
            <div>
              <Label htmlFor='operator' className='text-sm font-medium'>
                Operator
              </Label>
              <Select value={operator} onValueChange={(value) => setOperator(value as FilterOperator)}>
                <SelectTrigger id='operator' className='mt-1'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableOperators.map((op) => (
                    <SelectItem key={op} value={op}>
                      {operatorLabels[op]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor='value' className='text-sm font-medium'>
                Value
              </Label>
              {config.type === 'select' && config.options ? (
                <Select value={value} onValueChange={setValue}>
                  <SelectTrigger id='value' className='mt-1'>
                    <SelectValue placeholder='Select value...' />
                  </SelectTrigger>
                  <SelectContent>
                    {config.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id='value'
                  type={config.type === 'number' ? 'number' : config.type === 'date' ? 'date' : 'text'}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={`Enter ${config.type === 'number' ? 'number' : 'text'}...`}
                  className='mt-1'
                />
              )}
            </div>
          </div>

          <div className='flex justify-end space-x-2'>
            <Button variant='outline' size='sm' onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button size='sm' onClick={applyFilter}>
              Apply Filter
            </Button>
          </div>

          {hasActiveFilter && (
            <div className='pt-2 border-t'>
              <div className='text-sm text-muted-foreground'>
                Current filter: <span className='font-medium'>{operatorLabels[currentFilter.operator]}</span>{' '}
                <span className='font-medium'>"{currentFilter.value}"</span>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
