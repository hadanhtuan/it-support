'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/lib/hooks/use-toast';
import { useAuth } from '@/lib/context';
import { useTranslation } from '@/lib/i18n';
import { Ticket, TicketCategory, TicketPriority, TicketStatus, TicketType } from '@/lib/core/models';
import { ticketService } from '@/services/ticket.service';
import { TicketCloudinaryService } from '@/services/cloudinary';
import { Upload, X } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

function CreateTicketForm(): React.JSX.Element {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { userState } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [fileErrors, setFileErrors] = useState<{ images?: string; video?: string }>({});

  // Get initial category from URL
  const getInitialCategory = (): TicketCategory => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && Object.values(TicketCategory).includes(categoryParam as TicketCategory)) {
      return categoryParam as TicketCategory;
    }
    return TicketCategory.OTHER;
  };

  const [formData, setFormData] = useState<Partial<Ticket>>({
    title: '',
    description: '',
    category: getInitialCategory(),
    priority: TicketPriority.MEDIUM,
    type: TicketType.SUPPORT_REQUEST,
    status: TicketStatus.OPEN,
    creatorId: userState?.userInfo?.uid || '',
    creatorName: userState?.userInfo?.fullname || '',
    creatorEmail: userState?.userInfo?.email || '',
    creatorZaloId: userState?.userInfo?.zaloId || '',
    location: '',
    department: '',
    phoneNumber: userState?.userInfo?.phoneNumber || '',
    steps: '',
    expectedOutcome: '',
    actualOutcome: '',
    workaround: ''
  });

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = t('messages.titleRequired');
    }
    if (!formData.description?.trim()) {
      newErrors.description = t('messages.descriptionRequired');
    }
    if (!formData.category) {
      newErrors.category = t('messages.categoryRequired');
    }
    if (!formData.priority) {
      newErrors.priority = t('messages.priorityRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: t('common.error'),
        description: t('messages.pleaseFixErrors'),
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First, create the ticket to get the ticket ID
      const ticketData: Partial<Ticket> = {
        ...formData,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      };

      const ticketId = await ticketService.createTicket(ticketData);

      // Upload attachments if any
      if (images.length > 0 || video) {
        try {
          const { imageUrls, videoUrl } = await TicketCloudinaryService.uploadTicketAttachments(
            images,
            video,
            ticketId
          );

          // Update the ticket with the attachment URLs
          await ticketService.updateTicket(ticketId, {
            imageUrls,
            ...(videoUrl && { videoUrl })
          });
        } catch (uploadError) {
          console.error('Error uploading attachments:', uploadError);
          // Ticket was created but attachments failed - still show success but warn user
          toast({
            title: t('common.warning'),
            description: 'Phiếu đã được tạo nhưng có lỗi khi tải tệp đính kèm',
            variant: 'default'
          });
        }
      }

      toast({
        title: t('common.success'),
        description: t('messages.ticketCreatedSuccess'),
        variant: 'default'
      });

      router.push(`/tickets/${ticketId}`);
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: t('common.error'),
        description: t('messages.errorOccurred'),
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_IMAGES = 2;

    // Check if adding new files would exceed the limit
    if (images.length + selectedFiles.length > MAX_IMAGES) {
      setFileErrors((prev) => ({ ...prev, images: `Chỉ được tải lên tối đa ${MAX_IMAGES} ảnh` }));
      return;
    }

    // Validate file sizes
    const oversizedFiles = selectedFiles.filter((file) => file.size > MAX_IMAGE_SIZE);
    if (oversizedFiles.length > 0) {
      setFileErrors((prev) => ({ ...prev, images: 'Kích thước ảnh không được vượt quá 5MB' }));
      return;
    }

    setFileErrors((prev) => ({ ...prev, images: undefined }));
    setImages((prev) => [...prev, ...selectedFiles]);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

    if (selectedFile.size > MAX_VIDEO_SIZE) {
      setFileErrors((prev) => ({ ...prev, video: 'Kích thước video không được vượt quá 50MB' }));
      return;
    }

    setFileErrors((prev) => ({ ...prev, video: undefined }));
    setVideo(selectedFile);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setFileErrors((prev) => ({ ...prev, images: undefined }));
  };

  const removeVideo = () => {
    setVideo(null);
    setFileErrors((prev) => ({ ...prev, video: undefined }));
  };

  return (
    <div className='container max-w-3xl py-8'>
      <Card>
        <CardHeader>
          <CardTitle>{t('tickets.createTicket')}</CardTitle>
          <CardDescription>
            Mô tả chi tiết vấn đề bạn gặp phải để nhân viên IT có thể hỗ trợ hiệu quả nhất
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Basic Information */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Thông tin cơ bản</h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='title'>{t('tickets.title')} *</Label>
                  <Input
                    id='title'
                    name='title'
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder={t('tickets.titlePlaceholder')}
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && <p className='text-sm text-red-500'>{errors.title}</p>}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='category'>{t('tickets.category')} *</Label>
                  <Select
                    value={formData.category || ''}
                    onValueChange={(value) => handleSelectChange('category', value)}
                  >
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder='Chọn danh mục' />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TicketCategory).map((category) => (
                        <SelectItem key={category} value={category}>
                          {t(`ticketCategory.${category}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className='text-sm text-red-500'>{errors.category}</p>}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='priority'>{t('tickets.priority')} *</Label>
                  <Select
                    value={formData.priority || ''}
                    onValueChange={(value) => handleSelectChange('priority', value)}
                  >
                    <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
                      <SelectValue placeholder='Chọn độ ưu tiên' />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TicketPriority).map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {t(`ticketPriority.${priority}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.priority && <p className='text-sm text-red-500'>{errors.priority}</p>}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='type'>{t('tickets.type')}</Label>
                  <Select value={formData.type || ''} onValueChange={(value) => handleSelectChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn loại phiếu' />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TicketType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(`ticketType.${type}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description'>{t('tickets.description')} *</Label>
                <Textarea
                  id='description'
                  name='description'
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('tickets.descriptionPlaceholder')}
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className='text-sm text-red-500'>{errors.description}</p>}
              </div>
            </div>

            {/* Location Information */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Thông tin vị trí</h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='location'>{t('tickets.location')}</Label>
                  <Input
                    id='location'
                    name='location'
                    value={formData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder={t('tickets.locationPlaceholder')}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='department'>{t('tickets.department')}</Label>
                  <Input
                    id='department'
                    name='department'
                    value={formData.department || ''}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder={t('tickets.departmentPlaceholder')}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Thông tin liên hệ</h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='phoneNumber'>{t('tickets.phoneNumber')}</Label>
                  <Input
                    id='phoneNumber'
                    name='phoneNumber'
                    value={formData.phoneNumber || ''}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder={t('tickets.phoneNumberPlaceholder')}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='alternateContact'>{t('tickets.alternateContact')}</Label>
                  <Input
                    id='alternateContact'
                    name='alternateContact'
                    value={formData.alternateContact || ''}
                    onChange={(e) => handleInputChange('alternateContact', e.target.value)}
                    placeholder={t('tickets.alternateContactPlaceholder')}
                  />
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Chi tiết bổ sung</h3>

              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='steps'>{t('tickets.steps')}</Label>
                  <Textarea
                    id='steps'
                    name='steps'
                    value={formData.steps || ''}
                    onChange={(e) => handleInputChange('steps', e.target.value)}
                    placeholder={t('tickets.stepsPlaceholder')}
                    rows={3}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='expectedOutcome'>{t('tickets.expectedOutcome')}</Label>
                  <Textarea
                    id='expectedOutcome'
                    name='expectedOutcome'
                    value={formData.expectedOutcome || ''}
                    onChange={(e) => handleInputChange('expectedOutcome', e.target.value)}
                    placeholder={t('tickets.expectedOutcomePlaceholder')}
                    rows={2}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='actualOutcome'>{t('tickets.actualOutcome')}</Label>
                  <Textarea
                    id='actualOutcome'
                    name='actualOutcome'
                    value={formData.actualOutcome || ''}
                    onChange={(e) => handleInputChange('actualOutcome', e.target.value)}
                    placeholder={t('tickets.actualOutcomePlaceholder')}
                    rows={2}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='workaround'>{t('tickets.workaround')}</Label>
                  <Textarea
                    id='workaround'
                    name='workaround'
                    value={formData.workaround || ''}
                    onChange={(e) => handleInputChange('workaround', e.target.value)}
                    placeholder={t('tickets.workaroundPlaceholder')}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* File Attachments */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>{t('tickets.attachments')}</h3>

              {/* Images Upload */}
              <div className='space-y-2'>
                <Label htmlFor='images'>Ảnh chụp màn hình (Tối đa 2 ảnh, mỗi ảnh tối đa 5MB)</Label>
                <div className='flex items-center space-x-2'>
                  <Input
                    id='images'
                    type='file'
                    multiple
                    accept='image/jpeg,image/jpg,image/png,image/webp'
                    onChange={handleImageChange}
                    className='hidden'
                    disabled={images.length >= 2}
                  />
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => document.getElementById('images')?.click()}
                    disabled={images.length >= 2}
                  >
                    <Upload className='h-4 w-4 mr-2' />
                    Chọn ảnh ({images.length}/2)
                  </Button>
                </div>
                {fileErrors.images && <p className='text-sm text-red-500'>{fileErrors.images}</p>}

                {images.length > 0 && (
                  <div className='space-y-2'>
                    {images.map((file, index) => (
                      <div key={index} className='flex items-center justify-between p-2 bg-muted rounded'>
                        <span className='text-sm truncate flex-1'>
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                        </span>
                        <Button type='button' variant='ghost' size='sm' onClick={() => removeImage(index)}>
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video Upload */}
              <div className='space-y-2'>
                <Label htmlFor='video'>Video (Tối đa 1 video, tối đa 50MB)</Label>
                <div className='flex items-center space-x-2'>
                  <Input
                    id='video'
                    type='file'
                    accept='video/mp4,video/webm,video/mov,video/avi'
                    onChange={handleVideoChange}
                    className='hidden'
                    disabled={video !== null}
                  />
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => document.getElementById('video')?.click()}
                    disabled={video !== null}
                  >
                    <Upload className='h-4 w-4 mr-2' />
                    {video ? 'Đã chọn video' : 'Chọn video'}
                  </Button>
                </div>
                {fileErrors.video && <p className='text-sm text-red-500'>{fileErrors.video}</p>}

                {video && (
                  <div className='flex items-center justify-between p-2 bg-muted rounded'>
                    <span className='text-sm truncate flex-1'>
                      {video.name} ({(video.size / 1024 / 1024).toFixed(2)}MB)
                    </span>
                    <Button type='button' variant='ghost' size='sm' onClick={removeVideo}>
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className='flex justify-end space-x-4'>
              <Button type='button' variant='outline' onClick={() => router.back()} disabled={isSubmitting}>
                {t('common.cancel')}
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? t('common.creating') : t('tickets.createTicket')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CreateTicketPage(): React.JSX.Element {
  return (
    <Suspense fallback={<div className='container max-w-3xl py-8'>Loading...</div>}>
      <CreateTicketForm />
    </Suspense>
  );
}
