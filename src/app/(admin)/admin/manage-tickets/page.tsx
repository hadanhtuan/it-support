'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n';
import { Ticket, TicketStatus, TicketPriority, TicketCategory } from '@/lib/core/models';
import { ticketService } from '@/services/ticket.service';
import { Clock, User, MapPin, Search, Filter } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';

export default function ManageTicketsPage(): React.JSX.Element {
  const { t } = useTranslation();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'ALL'>('ALL');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const allTickets = await ticketService.getAllTickets();
      setTickets(allTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.creatorName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

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

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>{t('admin.manageTickets')}</h1>
        <p className='text-muted-foreground mt-2'>{t('admin.manageTicketsDescription')}</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Filter className='h-5 w-5' />
            <span>Bộ lọc và tìm kiếm</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Tìm kiếm phiếu...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TicketStatus | 'ALL')}>
              <SelectTrigger>
                <SelectValue placeholder='Trạng thái' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>Tất cả trạng thái</SelectItem>
                {Object.values(TicketStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {t(`ticketStatus.${status}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={priorityFilter}
              onValueChange={(value) => setPriorityFilter(value as TicketPriority | 'ALL')}
            >
              <SelectTrigger>
                <SelectValue placeholder='Độ ưu tiên' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>Tất cả độ ưu tiên</SelectItem>
                {Object.values(TicketPriority).map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {t(`ticketPriority.${priority}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={loadTickets} variant='outline'>
              Làm mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='text-2xl font-bold'>{tickets.length}</div>
            <p className='text-xs text-muted-foreground'>Tổng số phiếu</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='text-2xl font-bold text-blue-600'>
              {tickets.filter((t) => t.status === TicketStatus.OPEN).length}
            </div>
            <p className='text-xs text-muted-foreground'>Phiếu mở</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='text-2xl font-bold text-yellow-600'>
              {tickets.filter((t) => t.status === TicketStatus.IN_PROGRESS).length}
            </div>
            <p className='text-xs text-muted-foreground'>Đang xử lý</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='text-2xl font-bold text-red-600'>
              {tickets.filter((t) => t.priority === TicketPriority.URGENT).length}
            </div>
            <p className='text-xs text-muted-foreground'>Khẩn cấp</p>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách phiếu hỗ trợ ({filteredTickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='text-center py-8'>Đang tải...</div>
          ) : filteredTickets.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>Không tìm thấy phiếu hỗ trợ nào</div>
          ) : (
            <div className='space-y-4'>
              {filteredTickets.map((ticket) => (
                <Card key={ticket.id} className='hover:bg-muted/50 transition-colors'>
                  <CardContent className='p-4'>
                    <div className='flex items-start justify-between mb-3'>
                      <div className='flex-1'>
                        <div className='flex items-center space-x-2 mb-2'>
                          <h3 className='font-medium'>{ticket.title}</h3>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {t(`ticketPriority.${ticket.priority}`)}
                          </Badge>
                        </div>
                        <p className='text-sm text-muted-foreground line-clamp-2'>{ticket.description}</p>
                      </div>
                      <Badge className={getStatusColor(ticket.status)}>{t(`ticketStatus.${ticket.status}`)}</Badge>
                    </div>

                    <div className='flex items-center justify-between text-sm text-muted-foreground'>
                      <div className='flex items-center space-x-4'>
                        <div className='flex items-center space-x-1'>
                          <User className='h-4 w-4' />
                          <span>{ticket.creatorName}</span>
                        </div>
                        {ticket.location && (
                          <div className='flex items-center space-x-1'>
                            <MapPin className='h-4 w-4' />
                            <span>{ticket.location}</span>
                          </div>
                        )}
                        <div className='flex items-center space-x-1'>
                          <span>{t(`ticketCategory.${ticket.category}`)}</span>
                        </div>
                      </div>

                      <div className='flex items-center space-x-2'>
                        <div className='flex items-center space-x-1'>
                          <Clock className='h-3 w-3' />
                          <span className='text-xs'>
                            {ticket.createdAt instanceof Timestamp
                              ? ticket.createdAt.toDate().toLocaleDateString('vi-VN')
                              : new Date(ticket.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <Button asChild size='sm' variant='outline'>
                          <a href={`/tickets/${ticket.id}`}>Xem chi tiết</a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
