'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/context';
import { Collection, Ticket, TicketPriority, TicketStatus } from '@/lib/core/models';
import { FirestoreClientHelper } from '@/lib/firebase/client/firestore-client.helper';
import { useToast } from '@/lib/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import { formatFirestoreTimestamp } from '@/lib/utils';
import { Plus, FileText, AlertCircle } from 'lucide-react';

export default function MyTicketsPage(): React.JSX.Element {
  const { t } = useTranslation();
  const { userState } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved' | 'closed'>('all');

  useEffect(() => {
    if (userState?.userInfo?.uid) {
      loadMyTickets();
    }
  }, [userState?.userInfo?.uid]);

  const loadMyTickets = async () => {
    if (!userState?.userInfo?.uid) return;

    setIsLoading(true);
    try {
      const result = await FirestoreClientHelper.getMany<Ticket>(Collection.TICKETS, {
        conditions: [{ field: 'creatorId', op: '==', value: userState.userInfo.uid }],
        orderBy: [{ field: 'createdAt', op: 'desc' }]
      });

      setTickets(result.documents);
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast({
        title: t('common.error'),
        description: t('messages.errorOccurred'),
        variant: 'destructive'
      });
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

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === 'all') return true;
    if (filter === 'open') return ticket.status === TicketStatus.OPEN || ticket.status === TicketStatus.IN_PROGRESS;
    if (filter === 'resolved') return ticket.status === TicketStatus.RESOLVED;
    if (filter === 'closed') return ticket.status === TicketStatus.CLOSED;
    return true;
  });

  const getStatusCounts = () => {
    const open = tickets.filter((t) => t.status === TicketStatus.OPEN || t.status === TicketStatus.IN_PROGRESS).length;
    const resolved = tickets.filter((t) => t.status === TicketStatus.RESOLVED).length;
    const closed = tickets.filter((t) => t.status === TicketStatus.CLOSED).length;
    return { open, resolved, closed };
  };

  const counts = getStatusCounts();

  if (isLoading) {
    return (
      <div className='container py-8'>
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <Skeleton className='h-8 w-48' />
            <Skeleton className='h-10 w-32' />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Skeleton className='h-24' />
            <Skeleton className='h-24' />
            <Skeleton className='h-24' />
          </div>

          <div className='space-y-4'>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className='h-32' />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container py-8'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>{t('tickets.myTickets')}</h1>
            <p className='text-muted-foreground mt-1'>Quản lý và theo dõi các phiếu hỗ trợ của bạn</p>
          </div>
          <Button onClick={() => router.push('/user/create-ticket')}>
            <Plus className='h-4 w-4 mr-2' />
            {t('tickets.createTicket')}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card
            className={`cursor-pointer transition-colors ${filter === 'open' ? 'border-blue-500 bg-blue-50' : ''}`}
            onClick={() => setFilter('open')}
          >
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>Đang mở</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{counts.open}</div>
              <p className='text-xs text-muted-foreground mt-1'>Phiếu đang chờ hoặc đang xử lý</p>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-colors ${
              filter === 'resolved' ? 'border-green-500 bg-green-50' : ''
            }`}
            onClick={() => setFilter('resolved')}
          >
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>Đã giải quyết</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{counts.resolved}</div>
              <p className='text-xs text-muted-foreground mt-1'>Phiếu đã được giải quyết</p>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-colors ${filter === 'closed' ? 'border-gray-500 bg-gray-50' : ''}`}
            onClick={() => setFilter('closed')}
          >
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>Đã đóng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{counts.closed}</div>
              <p className='text-xs text-muted-foreground mt-1'>Phiếu đã hoàn tất</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className='flex gap-2'>
          <Button variant={filter === 'all' ? 'default' : 'outline'} size='sm' onClick={() => setFilter('all')}>
            Tất cả ({tickets.length})
          </Button>
          <Button variant={filter === 'open' ? 'default' : 'outline'} size='sm' onClick={() => setFilter('open')}>
            Đang mở ({counts.open})
          </Button>
          <Button
            variant={filter === 'resolved' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setFilter('resolved')}
          >
            Đã giải quyết ({counts.resolved})
          </Button>
          <Button variant={filter === 'closed' ? 'default' : 'outline'} size='sm' onClick={() => setFilter('closed')}>
            Đã đóng ({counts.closed})
          </Button>
        </div>

        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className='py-16 text-center'>
              <FileText className='h-16 w-16 mx-auto text-muted-foreground mb-4' />
              <h3 className='text-lg font-semibold mb-2'>
                {filter === 'all'
                  ? 'Chưa có phiếu hỗ trợ nào'
                  : `Không có phiếu ${
                      filter === 'open' ? 'đang mở' : filter === 'resolved' ? 'đã giải quyết' : 'đã đóng'
                    }`}
              </h3>
              <p className='text-muted-foreground mb-4'>
                {filter === 'all'
                  ? 'Tạo phiếu hỗ trợ đầu tiên của bạn để bắt đầu'
                  : 'Thử thay đổi bộ lọc để xem các phiếu khác'}
              </p>
              {filter === 'all' && (
                <Button onClick={() => router.push('/user/create-ticket')}>
                  <Plus className='h-4 w-4 mr-2' />
                  Tạo phiếu hỗ trợ
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-4'>
            {filteredTickets.map((ticket) => (
              <Card
                key={ticket.id}
                className='cursor-pointer hover:shadow-md transition-shadow'
                onClick={() => router.push(`/tickets/${ticket.id}`)}
              >
                <CardContent className='p-6'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <h3 className='text-lg font-semibold'>{ticket.title}</h3>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {t(`ticketPriority.${ticket.priority}`)}
                        </Badge>
                        <Badge className={getStatusColor(ticket.status)}>{t(`ticketStatus.${ticket.status}`)}</Badge>
                      </div>

                      <p className='text-sm text-muted-foreground line-clamp-2 mb-3'>{ticket.description}</p>

                      <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                        <span>{t(`ticketCategory.${ticket.category}`)}</span>
                        <span>•</span>
                        <span>Tạo: {formatFirestoreTimestamp(ticket.createdAt)}</span>
                        {ticket.assignedToName && (
                          <>
                            <span>•</span>
                            <span>Nhân viên: {ticket.assignedToName}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {ticket.priority === TicketPriority.URGENT && <AlertCircle className='h-5 w-5 text-red-500 ml-4' />}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
