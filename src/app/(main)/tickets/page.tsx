'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ticketService } from '@/services';
import { Ticket, TicketCategory, TicketStatus, TicketPriority } from '@/lib/core/models';
import { formatFirestoreTimestamp } from '@/lib/utils';
import {
  AlertCircle,
  Network,
  Laptop,
  Wrench,
  Filter,
  Eye
} from 'lucide-react';

export default function TicketsPage(): React.JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory | 'ALL'>('ALL');

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    // Check for category filter from URL
    const categoryParam = searchParams.get('category');
    if (categoryParam && Object.values(TicketCategory).includes(categoryParam as TicketCategory)) {
      setSelectedCategory(categoryParam as TicketCategory);
    }
  }, [searchParams]);

  useEffect(() => {
    // Filter tickets based on selected category
    if (selectedCategory === 'ALL') {
      setFilteredTickets(tickets);
    } else {
      setFilteredTickets(tickets.filter(ticket => ticket.category === selectedCategory));
    }
  }, [selectedCategory, tickets]);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const allTickets = await ticketService.getAllTickets();
      setTickets(allTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: TicketCategory) => {
    switch (category) {
      case TicketCategory.NETWORK:
        return <Network className="h-5 w-5" />;
      case TicketCategory.SOFTWARE:
        return <Laptop className="h-5 w-5" />;
      case TicketCategory.HARDWARE:
        return <Wrench className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: TicketCategory) => {
    switch (category) {
      case TicketCategory.NETWORK:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case TicketCategory.SOFTWARE:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case TicketCategory.HARDWARE:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: TicketCategory) => {
    switch (category) {
      case TicketCategory.NETWORK:
        return 'Sự cố về mạng';
      case TicketCategory.SOFTWARE:
        return 'Sự cố về phần mềm';
      case TicketCategory.HARDWARE:
        return 'Phần cứng';
      case TicketCategory.ACCOUNT:
        return 'Tài khoản';
      case TicketCategory.PRINTER:
        return 'Máy in';
      case TicketCategory.EMAIL:
        return 'Email';
      default:
        return 'Khác';
    }
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.OPEN:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case TicketStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case TicketStatus.RESOLVED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case TicketStatus.CLOSED:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case TicketPriority.URGENT:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case TicketPriority.HIGH:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case TicketPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case TicketPriority.LOW:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Danh sách Tickets</h1>
        <p className="text-muted-foreground mt-2">
          Tổng số: {filteredTickets.length} tickets
          {selectedCategory !== 'ALL' && ` (${getCategoryLabel(selectedCategory as TicketCategory)})`}
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'ALL' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('ALL')}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Tất cả ({tickets.length})
        </Button>
        <Button
          variant={selectedCategory === TicketCategory.NETWORK ? 'default' : 'outline'}
          onClick={() => setSelectedCategory(TicketCategory.NETWORK)}
          className="flex items-center gap-2"
        >
          <Network className="h-4 w-4" />
          Sự cố về mạng ({tickets.filter(t => t.category === TicketCategory.NETWORK).length})
        </Button>
        <Button
          variant={selectedCategory === TicketCategory.SOFTWARE ? 'default' : 'outline'}
          onClick={() => setSelectedCategory(TicketCategory.SOFTWARE)}
          className="flex items-center gap-2"
        >
          <Laptop className="h-4 w-4" />
          Phần mềm ({tickets.filter(t => t.category === TicketCategory.SOFTWARE).length})
        </Button>
        <Button
          variant={selectedCategory === TicketCategory.HARDWARE ? 'default' : 'outline'}
          onClick={() => setSelectedCategory(TicketCategory.HARDWARE)}
          className="flex items-center gap-2"
        >
          <Wrench className="h-4 w-4" />
          Phần cứng ({tickets.filter(t => t.category === TicketCategory.HARDWARE).length})
        </Button>
      </div>

      {/* Tickets List */}
      <div className="grid gap-4">
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Không có tickets nào</p>
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/tickets/${ticket.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(ticket.category)}
                      <CardTitle className="text-lg">{ticket.title}</CardTitle>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {ticket.description}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/tickets/${ticket.id}`);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getCategoryColor(ticket.category)}>
                    {getCategoryLabel(ticket.category)}
                  </Badge>
                  <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status}
                  </Badge>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                  {ticket.assignedToName && (
                    <Badge variant="outline">
                      Phụ trách: {ticket.assignedToName}
                    </Badge>
                  )}
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Tạo bởi: {ticket.creatorName || 'N/A'} • {formatFirestoreTimestamp(ticket.createdAt)}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
