'use client';

import { useAuth } from '@/lib/context/auth-context';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/lib/hooks/use-toast';
import { User } from '@/lib/core/models';
import { Collection } from '@/lib/core/models';
import { FirestoreClientHelper } from '@/lib/firebase/client/firestore-client.helper';
import { useAddressData } from '@/hooks/use-address-data';
import { UserCloudinaryService } from '@/services/cloudinary';
import { Camera, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function UpdateProfilePage(): React.JSX.Element {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { userState, refreshUser } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const [hasAvatarChanged, setHasAvatarChanged] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { provinces, wards, getWardsByProvinceId } = useAddressData();

  const [formData, setFormData] = useState({
    fullname: '',
    phoneNumber: '',
    zaloId: '',
    address: '',
    provinceId: '',
    wardId: '',
    age: '',
    gender: ''
  });

  useEffect(() => {
    if (userState?.userInfo) {
      const user = userState.userInfo;
      setFormData({
        fullname: user.fullname || '',
        phoneNumber: user.phoneNumber || '',
        zaloId: user.zaloId || '',
        address: user.address || '',
        provinceId: user.provinceId || '',
        wardId: user.wardId || '',
        age: user.age || '',
        gender: user.gender || ''
      });
      if (user.avatarUrl) {
        setAvatarPreview(user.avatarUrl);
      }
    }
  }, [userState]);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProvinceChange = (provinceId: string) => {
    setFormData((prev) => ({ ...prev, provinceId, wardId: '' }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: t('common.error'),
        description: t('profile.invalidImageType'),
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5000000) {
      toast({
        title: t('common.error'),
        description: t('profile.imageTooLarge'),
        variant: 'destructive'
      });
      return;
    }

    setNewAvatarFile(file);
    setHasAvatarChanged(true);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userId = userState?.userInfo?.id;
      if (!userId) throw new Error('User not found');

      // Upload avatar if changed
      let avatarUrl = userState?.userInfo?.avatarUrl;
      if (hasAvatarChanged && newAvatarFile) {
        avatarUrl = await UserCloudinaryService.uploadAvatar(newAvatarFile, userId);
      }

      // Get province and ward names
      const selectedProvince = provinces.find((p) => p.id === formData.provinceId);
      const selectedWard = wards.find((w) => w.id === formData.wardId);

      // Update user profile
      const updateData: Partial<User> = {
        fullname: formData.fullname,
        phoneNumber: formData.phoneNumber || undefined,
        zaloId: formData.zaloId || undefined,
        address: formData.address || undefined,
        provinceId: formData.provinceId || undefined,
        wardId: formData.wardId || undefined,
        provinceName: selectedProvince?.name,
        wardName: selectedWard?.name,
        age: formData.age || undefined,
        gender: formData.gender || undefined,
        avatarUrl: avatarUrl || undefined,
        isProfileCompleted: true,
        updatedAt: new Date()
      };

      await FirestoreClientHelper.updateDocument(Collection.USERS, userId, updateData);
      await refreshUser();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: t('common.error'),
        description: t('messages.errorOccurred'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
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

  return (
    <div className='container py-8'>
      <Card className='max-w-3xl mx-auto'>
        <CardHeader>
          <CardTitle>{t('profile.updateProfile')}</CardTitle>
          <CardDescription>{t('profile.updateProfileDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Avatar Upload */}
            <div className='flex flex-col items-center space-y-4'>
              <div className='relative group'>
                <Avatar className='h-32 w-32 cursor-pointer' onClick={handleAvatarClick}>
                  <AvatarImage src={avatarPreview} alt={formData.fullname} />
                  <AvatarFallback className='text-3xl'>{getInitials(formData.fullname || 'U')}</AvatarFallback>
                </Avatar>
                <div
                  className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'
                  onClick={handleAvatarClick}
                >
                  <Camera className='h-8 w-8 text-white' />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/jpeg,image/jpg,image/png,image/webp'
                onChange={handleAvatarChange}
                className='hidden'
              />
              <p className='text-sm text-muted-foreground'>{t('profile.clickToUploadAvatar')}</p>
            </div>

            {/* Personal Information */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>{t('profile.personalInfo')}</h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='fullname'>
                    {t('auth.fullName')} <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='fullname'
                    value={formData.fullname}
                    onChange={(e) => handleInputChange('fullname', e.target.value)}
                    placeholder={t('auth.fullNamePlaceholder')}
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='age'>{t('profile.age')}</Label>
                  <Input
                    id='age'
                    type='number'
                    min='18'
                    max='100'
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder={t('profile.agePlaceholder')}
                  />
                </div>

                <div className='space-y-2 md:col-span-2'>
                  <Label htmlFor='gender'>{t('profile.gender')}</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('profile.selectGender')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='male'>{t('profile.gendermale')}</SelectItem>
                      <SelectItem value='female'>{t('profile.genderfemale')}</SelectItem>
                      <SelectItem value='other'>{t('profile.genderother')}</SelectItem>
                      <SelectItem value='prefer-not-to-say'>{t('profile.genderprefer-not-to-say')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>{t('profile.contactInfo')}</h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='phoneNumber'>{t('tickets.phoneNumber')}</Label>
                  <Input
                    id='phoneNumber'
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder={t('tickets.phoneNumberPlaceholder')}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='zaloId'>{t('auth.zaloId')}</Label>
                  <Input
                    id='zaloId'
                    value={formData.zaloId}
                    onChange={(e) => handleInputChange('zaloId', e.target.value)}
                    placeholder={t('auth.zaloIdPlaceholder')}
                  />
                  <p className='text-xs text-muted-foreground'>{t('auth.zaloIdHelp')}</p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>{t('profile.address')}</h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='province'>{t('profile.province')}</Label>
                  <Select value={formData.provinceId} onValueChange={handleProvinceChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('profile.selectProvince')} />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((province) => (
                        <SelectItem key={province.id} value={province.id}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='ward'>{t('profile.ward')}</Label>
                  <Select
                    value={formData.wardId}
                    onValueChange={(value) => handleInputChange('wardId', value)}
                    disabled={!formData.provinceId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('profile.selectWard')} />
                    </SelectTrigger>
                    <SelectContent>
                      {getWardsByProvinceId(formData.provinceId).map((ward) => (
                        <SelectItem key={ward.id} value={ward.id}>
                          {ward.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2 md:col-span-2'>
                  <Label htmlFor='address'>{t('profile.streetAddress')}</Label>
                  <Textarea
                    id='address'
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder={t('profile.streetAddressPlaceholder')}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex justify-end space-x-3 pt-4'>
              <Button type='button' variant='outline' onClick={() => router.back()} disabled={isLoading}>
                {t('common.cancel')}
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isLoading ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
