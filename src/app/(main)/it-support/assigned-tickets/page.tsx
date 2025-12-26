'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/context';
import { useTranslation } from '@/lib/i18n';
import { Ticket, TicketStatus, TicketPriority, TicketCategory, User, UserRole } from '@/lib/core/models';
import { ticketService } from '@/services/ticket.service';
import { userService } from '@/services/user.service';
import { itSupportService } from '@/services/it-support.service';
import { useToast } from '@/lib/hooks/use-toast';
import { Clock, User as UserIcon, MapPin, Phone, MessageSquare } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

interface ExtendedTicket extends Ticket {
  assigneeInfo?: User;
  creatorInfo?: User;
  timeSpent?: number;
  resolutionNotes?: string;
}

export default function AssignedTicketsPage(): React.JSX.Element {
  const { t } = useTranslation();
  const { userState } = useAuth();
  const { toast } = useToast();

  const [tickets, setTickets] = useState<ExtendedTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<ExtendedTicket | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [timeSpent, setTimeSpent] = useState<number>(0);

  useEffect(() => {
    loadAssignedTickets();
  }, [userState?.userInfo?.uid]);

  const loadAssignedTickets = async () => {
    if (!userState?.userInfo?.uid) return;

    setIsLoading(true);
    try {
      const assignedTickets = await itSupportService.getAssignedTickets(userState.userInfo.uid);

      // Fetch additional user info for each ticket
      const ticketsWithUserInfo = await Promise.all(
        assignedTickets.map(async (ticket) => {
          const [assigneeInfo, creatorInfo] = await Promise.all([
            ticket.assignedToId ? userService.getUserByUid(ticket.assignedToId) : null,
            ticket.creatorId ? userService.getUserByUid(ticket.creatorId) : null
          ]);

          return {
            ...ticket,
            assigneeInfo: assigneeInfo || undefined,
            creatorInfo: creatorInfo || undefined
          };
        })
      );

      setTickets(ticketsWithUserInfo);
    } catch (error) {
      console.error('Error loading assigned tickets:', error);
      toast({
        title: t('common.error'),
        description: t('messages.errorOccurred'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (ticketId: string, newStatus: TicketStatus) => {
    setIsUpdating(true);
    try {
      await ticketService.updateTicket(ticketId, { status: newStatus });

      if (timeSpent > 0) {
        await itSupportService.logWorkTime(ticketId, userState?.userInfo?.uid || '', timeSpent, resolutionNotes);
      }

      await loadAssignedTickets();
      setSelectedTicket(null);
      setResolutionNotes('');
      setTimeSpent(0);

      toast({
        title: t('common.success'),
        description: t('messages.ticketUpdatedSuccess'),
        variant: 'default'
      });
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast({
        title: t('common.error'),
        description: t('messages.errorOccurred'),
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredTickets = filter === 'ALL' ? tickets : tickets.filter((ticket) => ticket.status === filter);

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

  if (isLoading) {
    return (
      <div className='container py-8'>
        <div className='text-center'>{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className='container py-8'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>{t('tickets.assignedTickets')}</h1>
        <p className='text-muted-foreground'>Quản lý các phiếu hỗ trợ được phân công cho bạn</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Tickets List */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-semibold'>Danh sách phiếu</h2>
            <Select value={filter} onValueChange={(value) => setFilter(value as TicketStatus | 'ALL')}>
              <SelectTrigger className='w-48'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>Tất cả</SelectItem>
                <SelectItem value={TicketStatus.OPEN}>{t(`ticketStatus.${TicketStatus.OPEN}`)}</SelectItem>
                <SelectItem value={TicketStatus.IN_PROGRESS}>
                  {t(`ticketStatus.${TicketStatus.IN_PROGRESS}`)}
                </SelectItem>
                <SelectItem value={TicketStatus.WAITING_FOR_CUSTOMER}>
                  {t(`ticketStatus.${TicketStatus.WAITING_FOR_CUSTOMER}`)}
                </SelectItem>
                <SelectItem value={TicketStatus.RESOLVED}>{t(`ticketStatus.${TicketStatus.RESOLVED}`)}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className='py-8 text-center'>
                <p className='text-muted-foreground'>Không có phiếu hỗ trợ nào được phân công</p>
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-3'>
              {filteredTickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className={`cursor-pointer transition-colors ${
                    selectedTicket?.id === ticket.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <CardContent className='p-4'>
                    <div className='flex items-start justify-between mb-2'>
                      <h3 className='font-medium line-clamp-2'>{ticket.title}</h3>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {t(`ticketPriority.${ticket.priority}`)}
                      </Badge>
                    </div>

                    <div className='flex items-center space-x-4 text-sm text-muted-foreground mb-2'>
                      <div className='flex items-center space-x-1'>
                        <UserIcon className='h-4 w-4' />
                        <span>{ticket.creatorInfo?.fullname || ticket.creatorName}</span>
                      </div>
                      {ticket.location && (
                        <div className='flex items-center space-x-1'>
                          <MapPin className='h-4 w-4' />
                          <span>{ticket.location}</span>
                        </div>
                      )}
                    </div>

                    <div className='flex items-center justify-between'>
                      <Badge className={getStatusColor(ticket.status)}>{t(`ticketStatus.${ticket.status}`)}</Badge>
                      <div className='flex items-center space-x-1 text-xs text-muted-foreground'>
                        <Clock className='h-3 w-3' />
                        <span>
                          {ticket.createdAt instanceof Timestamp
                            ? ticket.createdAt.toDate().toLocaleDateString('vi-VN')
                            : new Date(ticket.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Ticket Detail */}
        <div>
          {selectedTicket ? (
            <Card>
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div>
                    <CardTitle className='text-xl'>{selectedTicket.title}</CardTitle>
                    <CardDescription className='mt-1'>ID: {selectedTicket.id}</CardDescription>
                  </div>
                  <Badge className={getPriorityColor(selectedTicket.priority)}>
                    {t(`ticketPriority.${selectedTicket.priority}`)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Basic Information */}
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <Label className='text-xs text-muted-foreground'>Trạng thái</Label>
                    <Badge className={getStatusColor(selectedTicket.status)}>
                      {t(`ticketStatus.${selectedTicket.status}`)}
                    </Badge>
                  </div>
                  <div>
                    <Label className='text-xs text-muted-foreground'>Danh mục</Label>
                    <p>{t(`ticketCategory.${selectedTicket.category}`)}</p>
                  </div>
                  <div>
                    <Label className='text-xs text-muted-foreground'>Người tạo</Label>
                    <p>{selectedTicket.creatorInfo?.fullname || selectedTicket.creatorName}</p>
                  </div>
                  <div>
                    <Label className='text-xs text-muted-foreground'>Email liên hệ</Label>
                    <p>{selectedTicket.creatorEmail}</p>
                  </div>
                  {selectedTicket.phoneNumber && (
                    <div>
                      <Label className='text-xs text-muted-foreground'>Số điện thoại</Label>
                      <div className='flex items-center space-x-1'>
                        <Phone className='h-3 w-3' />
                        <p>{selectedTicket.phoneNumber}</p>
                      </div>
                    </div>
                  )}
                  {selectedTicket.location && (
                    <div>
                      <Label className='text-xs text-muted-foreground'>Vị trí</Label>
                      <div className='flex items-center space-x-1'>
                        <MapPin className='h-3 w-3' />
                        <p>{selectedTicket.location}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label className='text-xs text-muted-foreground'>Mô tả vấn đề</Label>
                  <p className='mt-1 text-sm bg-muted p-3 rounded'>{selectedTicket.description}</p>
                </div>

                {/* Steps to reproduce */}
                {selectedTicket.steps && (
                  <div>
                    <Label className='text-xs text-muted-foreground'>Các bước tái hiện</Label>
                    <p className='mt-1 text-sm bg-muted p-3 rounded'>{selectedTicket.steps}</p>
                  </div>
                )}

                {/* Expected vs Actual Outcome */}
                {(selectedTicket.expectedOutcome || selectedTicket.actualOutcome) && (
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {selectedTicket.expectedOutcome && (
                      <div>
                        <Label className='text-xs text-muted-foreground'>Kết quả mong đợi</Label>
                        <p className='mt-1 text-sm bg-muted p-3 rounded'>{selectedTicket.expectedOutcome}</p>
                      </div>
                    )}
                    {selectedTicket.actualOutcome && (
                      <div>
                        <Label className='text-xs text-muted-foreground'>Kết quả thực tế</Label>
                        <p className='mt-1 text-sm bg-muted p-3 rounded'>{selectedTicket.actualOutcome}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Work Time and Resolution */}
                {selectedTicket.status !== TicketStatus.CLOSED && selectedTicket.status !== TicketStatus.RESOLVED && (
                  <div className='space-y-4 border-t pt-4'>
                    <h4 className='font-medium'>Cập nhật trạng thái</h4>

                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <Label htmlFor='timeSpent'>Thời gian xử lý (phút)</Label>
                        <Input
                          id='timeSpent'
                          type='number'
                          value={timeSpent}
                          onChange={(e) => setTimeSpent(Number(e.target.value))}
                          min='0'
                          placeholder='0'
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor='resolutionNotes'>Ghi chú xử lý</Label>
                      <Textarea
                        id='resolutionNotes'
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        placeholder='Mô tả quá trình xử lý, giải pháp được áp dụng...'
                        rows={3}
                      />
                    </div>

                    <div className='flex space-x-2'>
                      <Button
                        onClick={() => handleStatusUpdate(selectedTicket.id!, TicketStatus.IN_PROGRESS)}
                        disabled={isUpdating || selectedTicket.status === TicketStatus.IN_PROGRESS}
                        variant='outline'
                      >
                        Đang xử lý
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(selectedTicket.id!, TicketStatus.WAITING_FOR_CUSTOMER)}
                        disabled={isUpdating || selectedTicket.status === TicketStatus.WAITING_FOR_CUSTOMER}
                        variant='outline'
                      >
                        Chờ khách hàng
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(selectedTicket.id!, TicketStatus.RESOLVED)}
                        disabled={isUpdating}
                      >
                        Đã giải quyết
                      </Button>
                    </div>
                  </div>
                )}

                {/* Contact Actions */}
                <div className='flex space-x-2 pt-4 border-t'>
                  {selectedTicket.phoneNumber && (
                    <Button variant='outline' asChild>
                      <a href={`tel:${selectedTicket.phoneNumber}`}>
                        <Phone className='h-4 w-4 mr-2' />
                        Gọi điện
                      </a>
                    </Button>
                  )}
                  {selectedTicket.creatorZaloId && (
                    <Button variant='outline' asChild>
                      <a
                        href={`https://zalo.me/${selectedTicket.creatorZaloId}`}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <MessageSquare className='h-4 w-4 mr-2' />
                        Zalo
                      </a>
                    </Button>
                  )}
                  <Button variant='outline' asChild>
                    <a href={`mailto:${selectedTicket.creatorEmail}`}>Email</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className='py-8 text-center'>
                <p className='text-muted-foreground'>Chọn một phiếu hỗ trợ để xem chi tiết</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
