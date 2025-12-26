'use client';

import { useAuth } from '@/lib/context/auth-context';
import { useTranslation } from '@/lib/i18n';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { User, UserRole } from '@/lib/core/models';
import { userService } from '@/services';
import { Mail, MapPin, Phone, Edit, Shield, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function UserProfilePage(): React.JSX.Element {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const { userState } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userId = params.id as string;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const userData = await userService.getUserByUid(userId);
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const isOwnProfile = userState?.userInfo?.id === userId;

  const getRoleLabel = (role: UserRole) => {
    return t(`userRoles.${role}`);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800';
      case UserRole.IT_SUPPORT:
        return 'bg-blue-100 text-blue-800';
      case UserRole.USER:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-yellow-100 text-yellow-800';
      case 'BLOCKED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className='container py-8 space-y-6'>
        <div className='flex items-center space-x-4'>
          <Skeleton className='h-24 w-24 rounded-full' />
          <div className='space-y-2'>
            <Skeleton className='h-8 w-64' />
            <Skeleton className='h-4 w-48' />
          </div>
        </div>
        <Skeleton className='h-64 w-full' />
        <Skeleton className='h-64 w-full' />
      </div>
    );
  }

  if (!user) {
    return (
      <div className='container py-8'>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-center text-muted-foreground'>{t('messages.noDataAvailable')}</p>
            <div className='flex justify-center mt-4'>
              <Button onClick={() => router.back()}>{t('common.back')}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container py-8 space-y-6'>
      {/* Header Section */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
            <div className='flex items-center space-x-4'>
              <Avatar className='h-24 w-24'>
                <AvatarImage src={user.avatarUrl} alt={user.fullname} />
                <AvatarFallback className='text-2xl'>{getInitials(user.fullname)}</AvatarFallback>
              </Avatar>

              <div className='space-y-2'>
                <h1 className='text-3xl font-bold'>{user.fullname}</h1>
                <div className='flex items-center gap-2 flex-wrap'>
                  <Badge className={getRoleBadgeColor(user.role)}>{getRoleLabel(user.role)}</Badge>
                  <Badge className={getStatusBadgeColor(user.status)}>{user.status}</Badge>
                  {user.isProfileCompleted && (
                    <Badge variant='outline' className='flex items-center gap-1'>
                      <CheckCircle2 className='h-3 w-3' />
                      {t('profile.profileCompleted')}
                    </Badge>
                  )}
                </div>
                {user.rating !== undefined && (
                  <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                    <span className='text-yellow-500'>★</span>
                    <span>
                      {user.rating.toFixed(1)} {t('profile.rating')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {isOwnProfile && (
              <Button asChild>
                <Link href={`/${user.role === UserRole.IT_SUPPORT ? 'it-support' : 'user'}/update-profile`}>
                  <Edit className='h-4 w-4 mr-2' />
                  {t('profile.updateProfile')}
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.personalInfo')}</CardTitle>
          <CardDescription>{t('profile.personalInfoDescription')}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='flex items-start space-x-3'>
              <Mail className='h-5 w-5 text-muted-foreground mt-0.5' />
              <div className='space-y-1'>
                <p className='text-sm font-medium'>{t('auth.email')}</p>
                <p className='text-sm text-muted-foreground break-all'>{user.email}</p>
              </div>
            </div>

            {user.phoneNumber && (
              <div className='flex items-start space-x-3'>
                <Phone className='h-5 w-5 text-muted-foreground mt-0.5' />
                <div className='space-y-1'>
                  <p className='text-sm font-medium'>{t('tickets.phoneNumber')}</p>
                  <p className='text-sm text-muted-foreground'>{user.phoneNumber}</p>
                </div>
              </div>
            )}

            {user.zaloId && (
              <div className='flex items-start space-x-3'>
                <Phone className='h-5 w-5 text-muted-foreground mt-0.5' />
                <div className='space-y-1'>
                  <p className='text-sm font-medium'>{t('auth.zaloId')}</p>
                  <p className='text-sm text-muted-foreground'>{user.zaloId}</p>
                </div>
              </div>
            )}

            {(user.provinceName || user.wardName || user.address) && (
              <div className='flex items-start space-x-3'>
                <MapPin className='h-5 w-5 text-muted-foreground mt-0.5' />
                <div className='space-y-1'>
                  <p className='text-sm font-medium'>{t('profile.address')}</p>
                  <p className='text-sm text-muted-foreground'>
                    {[user.address, user.wardName, user.provinceName].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            )}

            {user.age && (
              <div className='flex items-start space-x-3'>
                <Calendar className='h-5 w-5 text-muted-foreground mt-0.5' />
                <div className='space-y-1'>
                  <p className='text-sm font-medium'>{t('profile.age')}</p>
                  <p className='text-sm text-muted-foreground'>
                    {user.age} {t('profile.yearsOld')}
                  </p>
                </div>
              </div>
            )}

            {user.gender && (
              <div className='flex items-start space-x-3'>
                <Shield className='h-5 w-5 text-muted-foreground mt-0.5' />
                <div className='space-y-1'>
                  <p className='text-sm font-medium'>{t('profile.gender')}</p>
                  <p className='text-sm text-muted-foreground'>{t(`profile.gender${user.gender}`)}</p>
                </div>
              </div>
            )}
          </div>

          {user.createdAt && (
            <>
              <Separator />
              <div className='text-sm text-muted-foreground'>
                <span className='font-medium'>{t('profile.memberSince')}: </span>
                {new Date(user.createdAt.seconds * 1000).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* IT Support Specific Information */}
      {user.role === UserRole.IT_SUPPORT && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.specializations')}</CardTitle>
              <CardDescription>{t('profile.specializationsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {(user as any).specializations && (user as any).specializations.length > 0 ? (
                <div className='flex flex-wrap gap-2'>
                  {(user as any).specializations.map((spec: string) => (
                    <Badge key={spec} variant='secondary'>
                      {t(`specializations.${spec.toLowerCase()}`)}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>{t('profile.noSpecializations')}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('profile.stats')}</CardTitle>
              <CardDescription>{t('profile.statsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <p className='text-sm font-medium text-muted-foreground'>{t('profile.totalTicketsResolved')}</p>
                  <p className='text-3xl font-bold'>{(user as any).resolvedTickets?.length || 0}</p>
                </div>

                <div className='space-y-2'>
                  <p className='text-sm font-medium text-muted-foreground'>{t('profile.currentlyAssigned')}</p>
                  <p className='text-3xl font-bold'>{(user as any).assignedTickets?.length || 0}</p>
                </div>

                {user.rating !== undefined && (
                  <div className='space-y-2'>
                    <p className='text-sm font-medium text-muted-foreground'>{t('profile.customerRating')}</p>
                    <p className='text-3xl font-bold flex items-center gap-1'>
                      {user.rating.toFixed(1)}
                      <span className='text-yellow-500 text-2xl'>★</span>
                    </p>
                  </div>
                )}
              </div>

              {(user as any).supportExperience && (
                <>
                  <Separator className='my-4' />
                  <div className='space-y-2'>
                    <p className='text-sm font-medium'>{t('profile.experience')}</p>
                    <p className='text-sm text-muted-foreground'>{(user as any).supportExperience}</p>
                  </div>
                </>
              )}

              {(user as any).yoe && (
                <div className='space-y-2 mt-4'>
                  <p className='text-sm font-medium'>{t('profile.yearsOfExperience')}</p>
                  <p className='text-sm text-muted-foreground'>
                    {(user as any).yoe} {t('profile.years')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {(user as any).certificates && (user as any).certificates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.certificates')}</CardTitle>
                <CardDescription>{t('profile.certificatesDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {(user as any).certificates.map((cert: any, index: number) => (
                    <div key={index} className='border rounded-lg p-4 space-y-2'>
                      <p className='font-medium'>{cert.description}</p>
                      <p className='text-sm text-muted-foreground'>{cert.evidence}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* User Statistics */}
      {user.role === UserRole.USER && (
        <Card>
          <CardHeader>
            <CardTitle>{t('profile.stats')}</CardTitle>
            <CardDescription>{t('profile.userStatsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <p className='text-sm font-medium text-muted-foreground'>{t('profile.totalTickets')}</p>
                <p className='text-3xl font-bold'>{user.ticketCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
