'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/context';
import { Collection, Ticket, TicketPriority, TicketStatus } from '@/lib/core/models';
import { FirestoreClientHelper } from '@/lib/firebase/client/firestore-client.helper';
import { useToast } from '@/lib/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import { formatFirestoreTimestamp } from '@/lib/utils';
import { ticketService } from '@/services/ticket.service';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  User as UserIcon
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function TicketDetailsPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const { userState } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const ticketId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (ticketId) {
      loadTicketDetails();
    }
  }, [ticketId]);

  const loadTicketDetails = async () => {
    if (!ticketId) return;

    setIsLoading(true);
    try {
      const ticketData = await FirestoreClientHelper.getItemById<Ticket>(Collection.TICKETS, ticketId);
      setTicket(ticketData);
    } catch (error) {
      console.error('Error loading ticket details:', error);
      toast({
        title: t('common.error'),
        description: t('messages.errorOccurred'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: TicketStatus) => {
    if (!ticket?.id) return;

    setIsUpdating(true);
    try {
      await ticketService.updateTicket(ticket.id, { status: newStatus });
      await loadTicketDetails();

      toast({
        title: t('common.success'),
        description: t('messages.ticketUpdatedSuccess'),
        variant: 'default'
      });
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast({
        title: t('common.error'),
        description: t('messages.errorOccurred'),
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getPriorityColor = (priority: TicketPriority): string => {
    switch (priority) {
      case TicketPriority.URGENT:
        return 'bg-red-100 text-red-800 border-red-200';
      case TicketPriority.HIGH:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case TicketPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case TicketPriority.LOW:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: TicketStatus): string => {
    switch (status) {
      case TicketStatus.OPEN:
        return 'bg-blue-100 text-blue-800';
      case TicketStatus.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800';
      case TicketStatus.WAITING_FOR_CUSTOMER:
        return 'bg-orange-100 text-orange-800';
      case TicketStatus.RESOLVED:
        return 'bg-green-100 text-green-800';
      case TicketStatus.CLOSED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canUpdateStatus = () => {
    if (!userState?.userInfo?.role) return false;
    return userState.userInfo.role === 'IT_SUPPORT' || userState.userInfo.role === 'ADMIN';
  };

  const canContactUser = () => {
    return userState?.userInfo?.uid === ticket?.creatorId || canUpdateStatus();
  };

  if (isLoading) {
    return (
      <div className='container py-8 space-y-6'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-1/2' />
          <Skeleton className='h-4 w-1/4' />
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2 space-y-6'>
            <Card>
              <CardHeader>
                <Skeleton className='h-6 w-3/4' />
                <Skeleton className='h-4 w-1/2' />
              </CardHeader>
              <CardContent className='space-y-4'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-3/4' />
              </CardContent>
            </Card>
          </div>

          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <Skeleton className='h-5 w-2/3' />
              </CardHeader>
              <CardContent className='space-y-3'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-full' />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className='container py-16 text-center'>
        <AlertTriangle className='h-16 w-16 mx-auto text-muted-foreground mb-4' />
        <h2 className='text-2xl font-semibold mb-2'>Phiếu hỗ trợ không tồn tại</h2>
        <p className='text-muted-foreground mb-4'>
          Phiếu hỗ trợ này có thể đã bị xóa hoặc bạn không có quyền truy cập.
        </p>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className='container py-8'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <div>
            <div className='flex items-center space-x-3 mb-2'>
              <h1 className='text-3xl font-bold'>{ticket.title}</h1>
              <Badge className={getPriorityColor(ticket.priority)}>{t(`ticketPriority.${ticket.priority}`)}</Badge>
            </div>
            <p className='text-muted-foreground'>
              Mã phiếu: {ticket.id} • Tạo lúc {formatFirestoreTimestamp(ticket.createdAt)}
            </p>
          </div>

          <Badge className={getStatusColor(ticket.status)}>{t(`ticketStatus.${ticket.status}`)}</Badge>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Ticket Description */}
            <Card>
              <CardHeader>
                <CardTitle>Mô tả vấn đề</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='whitespace-pre-wrap'>{ticket.description}</p>
              </CardContent>
            </Card>

            {/* Steps to Reproduce */}
            {ticket.steps && (
              <Card>
                <CardHeader>
                  <CardTitle>Các bước tái hiện</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='whitespace-pre-wrap'>{ticket.steps}</p>
                </CardContent>
              </Card>
            )}

            {/* Expected vs Actual Outcome */}
            {(ticket.expectedOutcome || ticket.actualOutcome) && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {ticket.expectedOutcome && (
                  <Card>
                    <CardHeader>
                      <CardTitle className='text-lg'>Kết quả mong đợi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className='whitespace-pre-wrap'>{ticket.expectedOutcome}</p>
                    </CardContent>
                  </Card>
                )}

                {ticket.actualOutcome && (
                  <Card>
                    <CardHeader>
                      <CardTitle className='text-lg'>Kết quả thực tế</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className='whitespace-pre-wrap'>{ticket.actualOutcome}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Workaround */}
            {ticket.workaround && (
              <Card>
                <CardHeader>
                  <CardTitle>Giải pháp tạm thời</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='whitespace-pre-wrap'>{ticket.workaround}</p>
                </CardContent>
              </Card>
            )}

            {/* Attachments */}
            {(ticket.imageUrls?.length || ticket.videoUrl) && (
              <Card>
                <CardHeader>
                  <CardTitle>Tệp đính kèm</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {/* Images */}
                  {ticket.imageUrls && ticket.imageUrls.length > 0 && (
                    <div className='space-y-2'>
                      <h4 className='text-sm font-medium'>Ảnh chụp màn hình</h4>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {ticket.imageUrls.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='block border rounded-lg overflow-hidden hover:opacity-80 transition-opacity'
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt={`Screenshot ${index + 1}`} className='w-full h-auto object-cover' />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video */}
                  {ticket.videoUrl && (
                    <div className='space-y-2'>
                      <h4 className='text-sm font-medium'>Video</h4>
                      <video controls className='w-full rounded-lg border' preload='metadata'>
                        <source src={ticket.videoUrl} type='video/mp4' />
                        <source src={ticket.videoUrl} type='video/webm' />
                        Trình duyệt của bạn không hỗ trợ phát video.
                      </video>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Status Update Actions */}
            {canUpdateStatus() && ticket.status !== TicketStatus.CLOSED && (
              <Card>
                <CardHeader>
                  <CardTitle>Cập nhật trạng thái</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-wrap gap-2'>
                    {ticket.status !== TicketStatus.IN_PROGRESS && (
                      <Button
                        onClick={() => handleStatusUpdate(TicketStatus.IN_PROGRESS)}
                        disabled={isUpdating}
                        variant='outline'
                      >
                        Đang xử lý
                      </Button>
                    )}

                    {ticket.status !== TicketStatus.WAITING_FOR_CUSTOMER && (
                      <Button
                        onClick={() => handleStatusUpdate(TicketStatus.WAITING_FOR_CUSTOMER)}
                        disabled={isUpdating}
                        variant='outline'
                      >
                        Chờ khách hàng
                      </Button>
                    )}

                    {ticket.status !== TicketStatus.RESOLVED && (
                      <Button onClick={() => handleStatusUpdate(TicketStatus.RESOLVED)} disabled={isUpdating}>
                        <CheckCircle className='h-4 w-4 mr-2' />
                        Đã giải quyết
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Ticket Information */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin phiếu</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-3'>
                  <div className='flex items-center space-x-2 text-sm'>
                    <Calendar className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium'>Danh mục:</span>
                    <span>{t(`ticketCategory.${ticket.category}`)}</span>
                  </div>

                  <div className='flex items-center space-x-2 text-sm'>
                    <Clock className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium'>Tạo lúc:</span>
                    <span>{formatFirestoreTimestamp(ticket.createdAt)}</span>
                  </div>

                  {ticket.updatedAt && (
                    <div className='flex items-center space-x-2 text-sm'>
                      <Clock className='h-4 w-4 text-muted-foreground' />
                      <span className='font-medium'>Cập nhật:</span>
                      <span>{formatFirestoreTimestamp(ticket.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin liên hệ</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-3'>
                  <div className='flex items-center space-x-2 text-sm'>
                    <UserIcon className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium'>Người tạo:</span>
                    <span>{ticket.creatorName}</span>
                  </div>

                  <div className='flex items-center space-x-2 text-sm'>
                    <Mail className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium'>Email:</span>
                    <span className='break-all'>{ticket.creatorEmail}</span>
                  </div>

                  {ticket.phoneNumber && (
                    <div className='flex items-center space-x-2 text-sm'>
                      <Phone className='h-4 w-4 text-muted-foreground' />
                      <span className='font-medium'>Điện thoại:</span>
                      <span>{ticket.phoneNumber}</span>
                    </div>
                  )}

                  {ticket.location && (
                    <div className='flex items-center space-x-2 text-sm'>
                      <MapPin className='h-4 w-4 text-muted-foreground' />
                      <span className='font-medium'>Vị trí:</span>
                      <span>{ticket.location}</span>
                    </div>
                  )}

                  {ticket.department && (
                    <div className='text-sm'>
                      <span className='font-medium'>Phòng ban:</span>
                      <span className='ml-2'>{ticket.department}</span>
                    </div>
                  )}
                </div>

                {/* Contact Actions */}
                {canContactUser() && (
                  <>
                    <Separator />
                    <div className='space-y-2'>
                      <h4 className='text-sm font-medium'>Liên hệ</h4>
                      <div className='flex flex-col space-y-2'>
                        {ticket.phoneNumber && (
                          <Button variant='outline' size='sm' asChild>
                            <a href={`tel:${ticket.phoneNumber}`}>
                              <Phone className='h-4 w-4 mr-2' />
                              Gọi điện
                            </a>
                          </Button>
                        )}

                        {ticket.creatorZaloId && (
                          <Button variant='outline' size='sm' asChild>
                            <a
                              href={`https://zalo.me/${ticket.creatorZaloId}`}
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              <MessageSquare className='h-4 w-4 mr-2' />
                              Zalo
                            </a>
                          </Button>
                        )}

                        <Button variant='outline' size='sm' asChild>
                          <a href={`mailto:${ticket.creatorEmail}`}>
                            <Mail className='h-4 w-4 mr-2' />
                            Email
                          </a>
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Assignee Information */}
            {ticket.assignedToId && (
              <Card>
                <CardHeader>
                  <CardTitle>Nhân viên xử lý</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center space-x-2 text-sm'>
                    <UserIcon className='h-4 w-4 text-muted-foreground' />
                    <span>{ticket.assignedToName || 'Đang tải...'}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
