'use client';

/* eslint-disable react/react-in-jsx-scope */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { LanguageSelector } from '@/components/ui/language-selector';
import { NotificationBell } from '@/components/ui/notification-bell';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth, UserState } from '@/lib/context';
import { UserRole } from '@/lib/core/models';
import { firebaseAuth } from '@/lib/firebase/client/client-config';
import { useMobile } from '@/lib/hooks/use-mobile';
import { useToast } from '@/lib/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import { getInitials } from '@/lib/utils';
import {
  BookOpen,
  ListRestart,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  NotebookPen,
  Plus,
  School,
  ShieldUser,
  TriangleAlert,
  User,
  UserPen,
  UserRoundPen
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface IMenuItem {
  label: string;
  href: string;
  icon: any;
  isActive?: boolean;
}

export default function HeaderComponent(): JSX.Element {
  const isMobile = useMobile();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [menu, setMenu] = useState<IMenuItem[]>([]);
  const { t } = useTranslation();

  const router = useRouter();
  const { toast } = useToast(); // Custom toast hook

  const { userState, logout } = useAuth(); // Check auth state

  const getDefaultMenu = useCallback(
    (): IMenuItem[] => [
      {
        label: t('header.login'),
        href: '/auth/login',
        icon: LogIn,
        isActive: true
      },
      {
        label: t('header.register'),
        href: '/auth/register',
        icon: NotebookPen,
        isActive: true
      },
      {
        label: t('auth.forgotPassword'),
        href: '/auth/forgot-password',
        icon: ListRestart,
        isActive: true
      }
    ],
    [t]
  );

  const getMenuItems = useCallback(
    (us: UserState): IMenuItem[] => {
      const identity = us?.identity;
      const userRole = us?.userInfo?.role;

      if (!identity || !userRole) return getDefaultMenu();

      const menuItems: IMenuItem[] = [];

      switch (userRole) {
        case UserRole.USER:
          menuItems.push(
            {
              label: t('navigation.profile'),
              href: `/user/profile/${us.userInfo?.id}`,
              icon: UserPen,
              isActive: true
            },
            {
              label: t('tickets.createTicket'),
              href: '/user/create-ticket',
              icon: Plus,
              isActive: identity.emailVerified
            },
            {
              label: t('tickets.myTickets'),
              href: '/user/my-tickets',
              icon: TriangleAlert,
              isActive: true
            },
            {
              label: t('profile.updateProfile'),
              href: '/user/update-profile',
              icon: UserRoundPen,
              isActive: true
            }
          );
          break;
        case UserRole.IT_SUPPORT:
          menuItems.push(
            {
              label: t('navigation.profile'),
              href: `/user/profile/${us.userInfo?.id}`,
              icon: UserPen,
              isActive: true
            },
            {
              label: t('tickets.assignedTickets'),
              href: '/it-support/assigned-tickets',
              icon: TriangleAlert,
              isActive: true
            },
            {
              label: t('navigation.manageTickets'),
              href: '/it-support/manage-tickets',
              icon: BookOpen,
              isActive: identity.emailVerified
            },
            {
              label: t('profile.updateProfile'),
              href: '/user/update-profile',
              icon: UserRoundPen,
              isActive: true
            }
          );
          break;
        case UserRole.ADMIN:
          menuItems.push({
            label: t('header.dashboard'),
            href: '/admin',
            icon: ShieldUser,
            isActive: true
          });
          break;
        default:
          return getDefaultMenu();
      }

      return menuItems;
    },
    [t, getDefaultMenu]
  );

  useEffect(() => {
    // console.log(!!currentUser);
    setIsLoggedIn(!!userState);

    const identity = userState?.identity;
    const userRole = userState?.userInfo?.role;

    if (userState && identity && userRole) {
      setMenu(getMenuItems(userState));
    } else {
      setMenu(getDefaultMenu());
    }
  }, [userState, getMenuItems, getDefaultMenu]);

  const handleLogout = async (): Promise<void> => {
    setIsLoggedIn(false);
    toast({
      title: t('header.loggedOutSuccess'),
      description: t('header.loggedOutSuccess'),
      variant: 'default'
    });
    await logout();
    setMenu(getDefaultMenu());
    router.push('/');
  };

  return (
    <header className='sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80'>
      {/* Top Row */}
      <div className='border-b border-border'></div>
      {/* Bottom Row */}
      <div className='container flex h-16 items-center justify-between'>
        {/* Bottom Left - Logo */}
        <div className='flex items-center gap-2'>
          <Link href='/' className='flex items-center gap-2'>
            <Image src='/logo.svg' alt='IT Support Logo' width={50} height={50} className='w-[50px]' />
            <span className='hidden font-bold text-xl md:inline-block'>IT Support</span>
          </Link>
        </div>

        {/* Bottom Right - Language, Alert, Auth, User */}
        <div className='flex items-center gap-4'>
          {/* Mobile Menu */}
          {isMobile ? (
            <>
              {/* Mobile - Language Selector */}
              <LanguageSelector />

              {/* Mobile - Notification Bell (if logged in) */}
              {isLoggedIn && userState?.userInfo?.id && <NotificationBell userId={userState.userInfo.id} />}

              {/* Mobile - User Avatar (if logged in) */}
              {isLoggedIn && firebaseAuth.currentUser && (
                <Avatar className='h-8 w-8'>
                  <AvatarImage className='h-8 w-8' src={userState?.userInfo?.avatarUrl || ''} alt='User' />
                  <AvatarFallback>{getInitials(userState?.userInfo?.fullname || '')}</AvatarFallback>
                </Avatar>
              )}

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant='ghost' size='icon' className='md:hidden'>
                    <Menu className='h-5 w-5' />
                    <span className='sr-only'>{t('header.menu')}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side='right' className='w-80'>
                  <div className='flex flex-col gap-4 mt-8'>
                    {/* User Profile Section (if logged in) */}
                    {isLoggedIn && (
                      <>
                        <div className='flex items-center gap-3 p-4 border rounded-lg'>
                          <Avatar className='h-12 w-12'>
                            <AvatarImage src={userState?.userInfo?.avatarUrl || ''} alt='User' />
                            <AvatarFallback>{getInitials(userState?.userInfo?.fullname || '')}</AvatarFallback>
                          </Avatar>
                          <div className='flex flex-col'>
                            <p className='text-sm font-medium'>{userState?.userInfo?.fullname}</p>
                            <p className='text-xs text-muted-foreground'>{userState?.userInfo?.email}</p>
                          </div>
                        </div>

                        {/* Email Verification Alert (mobile) */}
                        {!userState?.identity?.emailVerified && (
                          <div className='flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
                            <TriangleAlert className='h-4 w-4 text-yellow-600' />
                            <p className='text-xs text-yellow-800'>{t('auth.emailVerificationSent')}</p>
                          </div>
                        )}

                        {/* User Menu Items */}
                        <div className='border-t pt-4'>
                          {menu.map((item) => (
                            <Link
                              key={item.label}
                              href={item.isActive ? item.href : ''}
                              className={`flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-accent transition-colors ${
                                item.isActive ? '' : 'text-muted-foreground'
                              }`}
                            >
                              <item.icon className='h-5 w-5' />
                              <span>{item.label}</span>
                            </Link>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Navigation Links */}
                    <div className={isLoggedIn ? 'border-t pt-4' : ''}>
                      <Link
                        href='/search?type=STUDY_PARTNER'
                        className='flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-accent transition-colors'
                      >
                        <User className='h-5 w-5' />
                        <span>{t('header.findPartner')}</span>
                      </Link>
                      <Link
                        href='/filter/tutor'
                        className='flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-accent transition-colors'
                      >
                        <BookOpen className='h-5 w-5' />
                        <span>{t('header.findTutor')}</span>
                      </Link>
                      <Link
                        href='https://shorturl.at/BFVbZ'
                        target='_blank'
                        className='flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-accent transition-colors'
                      >
                        <MessageSquare className='h-5 w-5' />
                        <span>{t('header.feedback')}</span>
                      </Link>
                      <Link
                        href='/help'
                        className='flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-accent transition-colors'
                      >
                        <User className='h-5 w-5' />
                        <span>{t('header.help')}</span>
                      </Link>
                    </div>

                    {/* Auth Actions */}
                    {isLoggedIn ? (
                      <div className='border-t pt-4'>
                        <Button variant='outline' className='w-full' onClick={() => handleLogout()}>
                          <LogOut className='h-4 w-4 mr-2' />
                          {t('header.logout')}
                        </Button>
                      </div>
                    ) : (
                      <div className='border-t pt-4 space-y-2'>
                        <Button variant='outline' className='w-full' onClick={() => router.push('/auth/login')}>
                          {t('header.login')}
                        </Button>
                        <Button className='w-full' onClick={() => router.push('/auth/register')}>
                          {t('header.register')}
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <>
              {/* Desktop - Language Selector */}
              <LanguageSelector />

              {/* Desktop - Notification Bell (if logged in) */}
              {isLoggedIn && userState?.userInfo?.id && <NotificationBell userId={userState.userInfo.id} />}

              {/* Desktop - Email Verification Alert */}
              {isLoggedIn && !userState?.identity?.emailVerified && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TriangleAlert className='h-5 w-5 text-yellow-600' />
                    </TooltipTrigger>
                    <TooltipContent className='bg-white shadow-md text-black rounded border-gray-300'>
                      <p>{t('auth.emailVerificationSent')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Desktop - Auth Buttons (if not logged in) */}
              {!isLoggedIn && (
                <div className='flex items-center gap-2'>
                  <Button variant='outline' size='sm' onClick={() => router.push('/auth/login')}>
                    {t('header.login')}
                  </Button>
                  <Button size='sm' onClick={() => router.push('/auth/register')}>
                    {t('header.register')}
                  </Button>
                </div>
              )}

              {/* Desktop - User Icon/Menu */}
              {firebaseAuth.currentUser && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage
                          className='h-8 w-8'
                          src={
                            isLoggedIn ? userState?.userInfo?.avatarUrl || '' : '/placeholder.svg?height=32&width=32'
                          }
                          alt='User'
                        />
                        <AvatarFallback>
                          {isLoggedIn ? getInitials(userState?.userInfo?.fullname || '') : ''}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    {isLoggedIn && (
                      <>
                        <DropdownMenuLabel className='font-normal'>
                          <div className='flex flex-col space-y-1'>
                            <p className='text-sm font-medium leading-none'>{userState?.userInfo?.fullname}</p>
                            <p className='text-xs leading-none text-muted-foreground'>{userState?.userInfo?.email}</p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {menu.map((item) => (
                      <DropdownMenuItem key={item.label} asChild>
                        <Link
                          href={item.isActive ? item.href : ''}
                          className={`flex items-center gap-6 ${item.isActive ? '' : 'text-muted-foreground'}`}
                        >
                          <item.icon className='h-4 w-4' />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    {isLoggedIn && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>{t('header.logout')}</DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
