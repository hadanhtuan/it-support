'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collection, SignInMethod, User, UserRole, UserStatus } from '@/lib/core/models';
import { FirestoreClientHelper } from '@/lib/firebase/client/firestore-client.helper';
import { useToast } from '@/lib/hooks/use-toast';
import { userService } from '@/services/user.service';
import { useQuery } from '@tanstack/react-query';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, Download, Loader2, MoreHorizontal } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ColumnFilter } from '../ui/column-filter';

// Helper function to get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

// Helper function to format date
function formatDate(dateString: string): string {
  console.log(dateString);
  return new Date(dateString).toDateString();
}

// Helper function to get status color
function getStatusColor(status: UserStatus): string {
  switch (status) {
    case UserStatus.ACTIVE:
      return 'bg-green-100 text-green-800';
    case UserStatus.INACTIVE:
      return 'bg-yellow-100 text-yellow-800';
    case UserStatus.BLOCKED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getSignInMethodBadgeColor(method: SignInMethod): string {
  switch (method) {
    case SignInMethod.EMAIL_LINK:
      return 'bg-yellow-100 text-yellow-800';
    case SignInMethod.GOOGLE:
      return 'bg-red-100 text-red-800';
    case SignInMethod.EMAIL_PASSWORD:
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Helper function to export users to CSV
function exportToCSV(users: User[]): void {
  const headers = ['ID', 'Fullname', 'Email', 'Status', 'Sign In Method', 'Ticket Count', 'Created At'].join(',');

  const rows = users.map((user: User) =>
    [
      user.id,
      user.fullname,
      user.email,
      user.status,
      user.signInMethod,
      0, // ticket count placeholder
      user.createdAt
    ].join(',')
  );

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'users.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Custom filter function that handles our filter objects
function customFilterFn(row: any, columnId: string, filterValue: any): boolean {
  if (!filterValue || typeof filterValue !== 'object') return true;

  const { operator, value } = filterValue;
  const cellValue = String(row.getValue(columnId)).toLowerCase();
  const searchValue = String(value).toLowerCase();

  switch (operator) {
    case 'equals':
      return cellValue === searchValue;
    case 'contains':
      return cellValue.includes(searchValue);
    case 'not_contains':
      return !cellValue.includes(searchValue);
    case 'starts_with':
      return cellValue.startsWith(searchValue);
    case 'ends_with':
      return cellValue.endsWith(searchValue);
    case 'greater_than':
      return Number.parseFloat(cellValue) > Number.parseFloat(searchValue);
    case 'less_than':
      return Number.parseFloat(cellValue) < Number.parseFloat(searchValue);
    default:
      return true;
  }
}

const fetchUsers = async (): Promise<User[]> => {
  try {
    const result = await FirestoreClientHelper.getMany<User>(Collection.USERS, {
      conditions: [{ field: 'role', op: '==', value: UserRole.USER }],
      orderBy: [{ field: 'createdAt', op: 'desc' }], // Assuming 'createdAt' is the field for sorting
      limitCount: 200,
      lastDoc: undefined
    });
    return result.documents;
  } catch (err) {
    console.error('Error fetching users:', err);
    return [];
  }
};
export function UserDataTable(): React.JSX.Element {
  const [users, setUsers] = useState<User[]>([]);

  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const { toast } = useToast();

  // const queryClient = useQueryClient();

  const {
    data: usersResult, // Renamed 'data' to 'users' for clarity
    error, // The error object itself
    isFetching: loading // True during any fetch, including background refetches
  } = useQuery<User[], Error>({
    queryKey: ['users'], // Unique key for this query
    queryFn: fetchUsers, // The function that fetches data
    placeholderData: [] // Provide an empty array initially to avoid undefined issues with React Table
  });

  useEffect(() => {
    if (!usersResult) {
      return;
    }
    setUsers(usersResult);
  }, [usersResult]);

  // Define columns for the data table
  const columns: ColumnDef<User>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
        />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'fullname',
      header: ({ column }) => (
        <div className='flex items-center space-x-2'>
          <ColumnFilter
            column={column}
            title='Fullname'
            config={{
              type: 'text',
              operators: ['equals', 'contains', 'not_contains', 'starts_with', 'ends_with']
            }}
          />
          <Button
            variant='ghost'
            size='sm'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='h-8 px-2'
          >
            <ArrowUpDown className='h-4 w-4' />
          </Button>
        </div>
      ),
      cell: ({ row }): React.JSX.Element => {
        const user = row.original;
        return (
          <div className='flex items-center space-x-3'>
            <Avatar className='h-8 w-8'>
              {user.avatar && <AvatarImage src={user.avatarUrl || '/placeholder.svg'} alt={user.fullname} />}
              <AvatarFallback>{getInitials(user.fullname)}</AvatarFallback>
            </Avatar>
            <div>
              <div className='font-medium'>{user.fullname}</div>
              <div className='text-sm text-muted-foreground'>{user.email}</div>
            </div>
          </div>
        );
      },
      filterFn: customFilterFn
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <div className='flex items-center space-x-2'>
          <ColumnFilter
            column={column}
            title='Status'
            config={{
              type: 'select',
              options: [
                { label: 'Active', value: UserStatus.ACTIVE },
                { label: 'Inactive', value: UserStatus.INACTIVE },
                { label: 'Blocked', value: UserStatus.BLOCKED }
              ]
            }}
          />
          <Button
            variant='ghost'
            size='sm'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='h-8 px-2'
          >
            <ArrowUpDown className='h-4 w-4' />
          </Button>
        </div>
      ),
      cell: ({ row }): React.JSX.Element => {
        const status = row.getValue('status') as User['status'];
        return (
          <Badge className={getStatusColor(status)} variant='outline'>
            {status}
          </Badge>
        );
      },
      filterFn: customFilterFn
    },
    {
      accessorKey: 'signInMethod',
      header: ({ column }) => (
        <div className='flex items-center space-x-2'>
          <ColumnFilter
            column={column}
            title='Sign In Method'
            config={{
              type: 'select',
              options: [
                { label: 'Email Link', value: SignInMethod.EMAIL_LINK },
                { label: 'Google', value: SignInMethod.GOOGLE },
                { label: 'Email/Password', value: SignInMethod.EMAIL_PASSWORD }
              ]
            }}
          />
          <Button
            variant='ghost'
            size='sm'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='h-8 px-2'
          >
            <ArrowUpDown className='h-4 w-4' />
          </Button>
        </div>
      ),
      cell: ({ row }): React.JSX.Element => {
        const signInMethod = row.getValue('signInMethod') as User['signInMethod'];
        return (
          <Badge className={getSignInMethodBadgeColor(signInMethod)} variant='outline'>
            {signInMethod}
          </Badge>
        );
      },
      filterFn: customFilterFn
    },
    {
      accessorKey: 'ticketCount',
      header: ({ column }) => (
        <div className='flex items-center space-x-2'>
          <ColumnFilter
            column={column}
            title='Tickets'
            config={{
              type: 'number',
              operators: ['equals', 'greater_than', 'less_than']
            }}
          />
          <Button
            variant='ghost'
            size='sm'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='h-8 px-2'
          >
            <ArrowUpDown className='h-4 w-4' />
          </Button>
        </div>
      ),
      cell: ({ row }): React.JSX.Element => {
        const user = row.original as User;
        return <div className='text-center'>{user.ticketCount || 0}</div>;
      },
      filterFn: customFilterFn
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <div className='flex items-center space-x-2'>
          <ColumnFilter
            column={column}
            title='Joined'
            config={{
              type: 'date',
              operators: ['equals', 'greater_than', 'less_than']
            }}
          />
          <Button
            variant='ghost'
            size='sm'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='h-8 px-2'
          >
            <ArrowUpDown className='h-4 w-4' />
          </Button>
        </div>
      ),
      cell: ({ row }): React.JSX.Element => {
        const user = row.original;
        return <div>{formatDate(user.createdAt || '')}</div>;
      },
      filterFn: customFilterFn
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }): React.JSX.Element => {
        const user = row.original;

        const handleStatusChange = (newStatus: User['status']): void => {
          toast({
            title: 'User status updated',
            description: `${user.fullname}'s status changed to ${newStatus}`
          });
        };

        const copyId = (): void => {
          navigator.clipboard.writeText(user.id);
          toast({
            title: 'ID Copied',
            description: 'User ID copied to clipboard'
          });
        };

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleStatusChange(UserStatus.ACTIVE)}
                disabled={user.status === UserStatus.ACTIVE}
              >
                Active
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange(UserStatus.INACTIVE)}
                disabled={user.status === UserStatus.INACTIVE}
              >
                Inactive
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange(UserStatus.BLOCKED)}
                disabled={user.status === UserStatus.INACTIVE}
                className='text-red-600'
              >
                Blocked
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

  const table = useReactTable({
    data: users, // Use the fetched users or an empty array
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    }
  });

  // Handle bulk actions with confirmation
  const handleBulkAction = async (action: UserStatus): Promise<void> => {
    const selectedUsers = table.getFilteredSelectedRowModel().rows.map((row) => row.original);
    const userIds: string[] = selectedUsers.map((user) => user.id);

    await userService.bulkUpdateStatus({
      status: action,
      userIds
    });

    // Update local state
    setUsers((prevUsers) => prevUsers.map((user) => (userIds.includes(user.id) ? { ...user, status: action } : user)));

    toast({
      title: 'Bulk Action Completed',
      description: `Successfully updated ${selectedUsers.length} user(s)`
    });

    // Clear selection
    setRowSelection({});
  };

  const clearAllFilters = (): void => {
    table.resetColumnFilters();
  };

  const hasActiveFilters = table.getState().columnFilters.length > 0;

  return (
    <div className='space-y-4'>
      {/* Top Actions Bar */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          {hasActiveFilters && (
            <Button variant='outline' size='sm' onClick={clearAllFilters}>
              Clear All Filters ({table.getState().columnFilters.length})
            </Button>
          )}
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <div className='flex items-center space-x-2'>
              <span className='text-sm text-muted-foreground'>
                {table.getFilteredSelectedRowModel().rows.length} selected
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='sm'>
                    Bulk Actions <ChevronDown className='ml-2 h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick={() => handleBulkAction(UserStatus.ACTIVE)}>Active</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction(UserStatus.INACTIVE)}>Inactive</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleBulkAction(UserStatus.BLOCKED)} className='text-red-600'>
                    Blocked
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <div className='flex items-center space-x-2'>
          <Button variant='outline' size='sm' onClick={() => exportToCSV(users as User[])}>
            <Download className='mr-2 h-4 w-4' />
            Export
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm'>
                Columns <ChevronDown className='ml-2 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className='capitalize'
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className='flex justify-center items-center py-8'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
          <span className='ml-2'>Loading users...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-800 rounded-md p-4'>
          <p>{String(error)}</p>
          <Button variant='outline' size='sm' className='mt-2' onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )}

      {/* Data Table */}
      {!loading && !error && (
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className='bg-muted/50'>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className='py-3'>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className='h-24 text-center'>
                    {loading ? 'Loading...' : 'No results.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && (
        <div className='flex items-center justify-between space-x-2'>
          <div className='text-sm text-muted-foreground'>
            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
            selected.
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button variant='outline' size='sm' onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
