'use client';

import { Search, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NotificationBell } from '@/components/ui/notification-bell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LanguageSelector } from '@/components/ui/language-selector';
import { useTranslation } from '@/lib/i18n';
import React from 'react';
import { useAuth } from '@/lib/context';
import { useToast } from '@/lib/hooks/use-toast';
import { useRouter } from 'next/navigation';

export function AdminHeader(): React.JSX.Element {
  const { userState, logout } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const router = useRouter();

  const handleLogout = async (): Promise<void> => {
    toast({
      title: t('admin.loggedOutSuccessfully'),
      description: t('admin.loggedOutDescription'),
      variant: 'default'
    });
    await logout();
    router.push('/');
  };

  return (
    <header className='bg-white shadow-sm border-b px-6 py-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
            <Input placeholder={t('admin.search.placeholder')} className='pl-10 w-80' />
          </div>
        </div>

        <div className='flex items-center space-x-4'>
          <LanguageSelector variant='ghost' />
          {userState?.userInfo?.id && <NotificationBell userId={userState.userInfo.id} />}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
                <Avatar className='h-8 w-8'>
                  <AvatarImage src='/placeholder.svg?height=32&width=32' alt='Admin' />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56' align='end' forceMount>
              <DropdownMenuLabel className='font-normal'>
                <div className='flex flex-col space-y-1'>
                  <p className='text-sm font-medium leading-none'>{userState?.userInfo?.fullname}</p>
                  <p className='text-xs leading-none text-muted-foreground'>{userState?.userInfo?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className='mr-2 h-4 w-4' />
                <span>{t('admin.profile')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className='mr-2 h-4 w-4' />
                <span>{t('admin.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
