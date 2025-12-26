'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { Ticket, TicketStatus, TicketPriority, TicketCategory } from '@/lib/core/models';
import { ticketService } from '@/services/ticket.service';
import { Clock, User, MapPin, AlertTriangle, Phone, MessageSquare, Mail } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';

export default function UrgentIssuesPage(): React.JSX.Element {
  const { t } = useTranslation();

  const [urgentTickets, setUrgentTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUrgentTickets();
  }, []);

  const loadUrgentTickets = async () => {
    setIsLoading(true);
    try {
      const allTickets = await ticketService.getAllTickets();
      // Filter for urgent and high priority tickets that are not closed
      const urgent = allTickets.filter(
        (ticket) =>
          (ticket.priority === TicketPriority.URGENT || ticket.priority === TicketPriority.HIGH) &&
          ticket.status !== TicketStatus.CLOSED &&
          ticket.status !== TicketStatus.RESOLVED
      );

      // Sort by priority (urgent first) then by creation date
      urgent.sort((a, b) => {
        if (a.priority === TicketPriority.URGENT && b.priority !== TicketPriority.URGENT) return -1;
        if (b.priority === TicketPriority.URGENT && a.priority !== TicketPriority.URGENT) return 1;

        const aDate = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt);
        const bDate = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt);
        return aDate.getTime() - bDate.getTime();
      });

      setUrgentTickets(urgent);
    } catch (error) {
      console.error('Error loading urgent tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: TicketPriority): string => {
    switch (priority) {
      case TicketPriority.URGENT:
        return 'bg-red-100 text-red-800 border-red-200';
      case TicketPriority.HIGH:
        return 'bg-orange-100 text-orange-800 border-orange-200';
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeSinceCreated = (createdAt: Timestamp | Date | string): string => {
    const date = createdAt instanceof Timestamp ? createdAt.toDate() : new Date(createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
    }
  };

  const getUrgencyLevel = (ticket: Ticket): { level: string; color: string } => {
    const createdDate = ticket.createdAt instanceof Timestamp ? ticket.createdAt.toDate() : new Date(ticket.createdAt);
    const hoursOld = (new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60);

    if (ticket.priority === TicketPriority.URGENT) {
      if (hoursOld > 4) {
        return { level: 'CỰC KỲ KHẨN CẤP', color: 'bg-red-600 text-white' };
      } else if (hoursOld > 2) {
        return { level: 'RẤT KHẨN CẤP', color: 'bg-red-500 text-white' };
      } else {
        return { level: 'KHẨN CẤP', color: 'bg-red-400 text-white' };
      }
    } else if (ticket.priority === TicketPriority.HIGH) {
      if (hoursOld > 24) {
        return { level: 'QUÁ HẠN', color: 'bg-orange-600 text-white' };
      } else {
        return { level: 'ƯU TIÊN CAO', color: 'bg-orange-400 text-white' };
      }
    }

    return { level: 'BÌNH THƯỜNG', color: 'bg-gray-400 text-white' };
  };

  return (
    <div className='space-y-6'>
      <div>
        <div className='flex items-center space-x-3'>
          <AlertTriangle className='h-8 w-8 text-red-500' />
          <div>
            <h1 className='text-3xl font-bold tracking-tight text-red-600'>{t('admin.urgentIssues')}</h1>
            <p className='text-muted-foreground mt-1'>Các vấn đề khẩn cấp cần được xử lý ngay lập tức</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className='border-red-200'>
          <CardContent className='p-6'>
            <div className='text-3xl font-bold text-red-600'>
              {urgentTickets.filter((t) => t.priority === TicketPriority.URGENT).length}
            </div>
            <p className='text-sm text-red-600 font-medium'>Phiếu khẩn cấp</p>
          </CardContent>
        </Card>

        <Card className='border-orange-200'>
          <CardContent className='p-6'>
            <div className='text-3xl font-bold text-orange-600'>
              {urgentTickets.filter((t) => t.priority === TicketPriority.HIGH).length}
            </div>
            <p className='text-sm text-orange-600 font-medium'>Ưu tiên cao</p>
          </CardContent>
        </Card>

        <Card className='border-yellow-200'>
          <CardContent className='p-6'>
            <div className='text-3xl font-bold text-yellow-600'>
              {urgentTickets.filter((t) => t.status === TicketStatus.OPEN).length}
            </div>
            <p className='text-sm text-yellow-600 font-medium'>Chưa được xử lý</p>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <AlertTriangle className='h-5 w-5 text-red-500' />
            <span>Danh sách vấn đề khẩn cấp ({urgentTickets.length})</span>
          </CardTitle>
          <CardDescription>Các phiếu hỗ trợ có độ ưu tiên cao và khẩn cấp</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='text-center py-8'>
              <div className='flex items-center justify-center space-x-2'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-red-600'></div>
                <span>Đang tải các vấn đề khẩn cấp...</span>
              </div>
            </div>
          ) : urgentTickets.length === 0 ? (
            <div className='text-center py-8'>
              <AlertTriangle className='h-16 w-16 mx-auto text-green-400 mb-4' />
              <h3 className='text-lg font-medium text-green-600 mb-2'>Tuyệt vời! Không có vấn đề khẩn cấp nào</h3>
              <p className='text-muted-foreground'>
                Tất cả các phiếu hỗ trợ ưu tiên cao đã được xử lý hoặc giải quyết.
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {urgentTickets.map((ticket) => {
                const urgencyLevel = getUrgencyLevel(ticket);
                return (
                  <Card key={ticket.id} className='border-l-4 border-l-red-500 hover:bg-muted/50 transition-colors'>
                    <CardContent className='p-4'>
                      <div className='flex items-start justify-between mb-3'>
                        <div className='flex-1'>
                          <div className='flex items-center space-x-2 mb-2'>
                            <Badge className={urgencyLevel.color}>{urgencyLevel.level}</Badge>
                            <Badge className={getPriorityColor(ticket.priority)}>
                              {t(`ticketPriority.${ticket.priority}`)}
                            </Badge>
                            <Badge className={getStatusColor(ticket.status)}>
                              {t(`ticketStatus.${ticket.status}`)}
                            </Badge>
                          </div>

                          <h3 className='font-semibold text-lg mb-2'>{ticket.title}</h3>
                          <p className='text-sm text-muted-foreground mb-3 line-clamp-2'>{ticket.description}</p>

                          <div className='flex items-center space-x-4 text-sm text-muted-foreground'>
                            <div className='flex items-center space-x-1'>
                              <User className='h-4 w-4' />
                              <span className='font-medium'>{ticket.creatorName}</span>
                            </div>
                            {ticket.location && (
                              <div className='flex items-center space-x-1'>
                                <MapPin className='h-4 w-4' />
                                <span>{ticket.location}</span>
                              </div>
                            )}
                            <div className='flex items-center space-x-1'>
                              <Clock className='h-4 w-4' />
                              <span className='font-medium text-red-600'>{getTimeSinceCreated(ticket.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center justify-between'>
                        <div className='text-xs text-muted-foreground'>
                          <span>Danh mục: {t(`ticketCategory.${ticket.category}`)}</span>
                          {ticket.department && <span className='ml-3'>Phòng ban: {ticket.department}</span>}
                        </div>

                        <div className='flex items-center space-x-2'>
                          {/* Contact Options */}
                          <div className='flex space-x-1'>
                            {ticket.phoneNumber && (
                              <Button size='sm' variant='outline' asChild>
                                <a href={`tel:${ticket.phoneNumber}`} title='Gọi điện'>
                                  <Phone className='h-4 w-4' />
                                </a>
                              </Button>
                            )}

                            {ticket.creatorZaloId && (
                              <Button size='sm' variant='outline' asChild>
                                <a
                                  href={`https://zalo.me/${ticket.creatorZaloId}`}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  title='Liên hệ Zalo'
                                >
                                  <MessageSquare className='h-4 w-4' />
                                </a>
                              </Button>
                            )}

                            <Button size='sm' variant='outline' asChild>
                              <a href={`mailto:${ticket.creatorEmail}`} title='Gửi email'>
                                <Mail className='h-4 w-4' />
                              </a>
                            </Button>
                          </div>

                          <Button asChild size='sm' className='bg-red-600 hover:bg-red-700'>
                            <a href={`/tickets/${ticket.id}`}>XỬ LÝ NGAY</a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <div className='flex justify-center'>
        <Button onClick={loadUrgentTickets} variant='outline' className='w-48'>
          <AlertTriangle className='h-4 w-4 mr-2' />
          Làm mới danh sách
        </Button>
      </div>
    </div>
  );
}
