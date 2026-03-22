import { useQuery } from '@tanstack/react-query';
import { ticketService } from '@/services/ticket.service';
import { Ticket, TicketCategory, TicketStatus } from '@/lib/core/models';

export interface CategoryStat {
  label: string;
  percent: number;
  color: string;
}

export interface PublicTicketStats {
  total: number;
  inProgress: number;
  resolved: number;
  waitingForCustomer: number;
  categoryBreakdown: CategoryStat[];
  recentTickets: Ticket[];
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  [TicketCategory.NETWORK]: { label: 'Network', color: '#3b82f6' },
  [TicketCategory.HARDWARE]: { label: 'Hardware', color: '#a855f7' },
  [TicketCategory.SOFTWARE]: { label: 'Software', color: '#22c55e' },
  [TicketCategory.PRINTER]: { label: 'Printer', color: '#f97316' },
  [TicketCategory.EMAIL]: { label: 'Email', color: '#ec4899' },
  [TicketCategory.ACCOUNT]: { label: 'Account', color: '#eab308' },
  [TicketCategory.OTHER]: { label: 'Other', color: '#94a3b8' }
};

function calculateStats(tickets: Ticket[]): PublicTicketStats {
  const total = tickets.length;

  const inProgress = tickets.filter((t) => t.status === TicketStatus.IN_PROGRESS).length;
  const resolved = tickets.filter(
    (t) => t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED
  ).length;
  const waitingForCustomer = tickets.filter(
    (t) => t.status === TicketStatus.WAITING_FOR_CUSTOMER
  ).length;

  // Count tickets per category
  const categoryCounts: Record<string, number> = {};
  for (const ticket of tickets) {
    const cat = ticket.category ?? TicketCategory.OTHER;
    categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
  }

  // Sort by count descending, take top 4, then calculate percentages
  const sorted = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a);
  const top4 = sorted.slice(0, 4);
  const top4Total = top4.reduce((sum, [, c]) => sum + c, 0);

  const categoryBreakdown: CategoryStat[] = top4.map(([cat, count], i, arr) => {
    // Distribute the last item to ensure sum = 100
    const isLast = i === arr.length - 1;
    const allocated = arr.slice(0, i).reduce((s, [, c]) => s + Math.round((c / top4Total) * 100), 0);
    const percent = isLast ? 100 - allocated : Math.round((count / top4Total) * 100);
    const config = CATEGORY_CONFIG[cat] ?? { label: cat, color: '#94a3b8' };
    return { label: config.label, percent, color: config.color };
  });

  const recentTickets = tickets.slice(0, 3);

  return { total, inProgress, resolved, waitingForCustomer, categoryBreakdown, recentTickets };
}

// Shared query key — React Query deduplicates concurrent calls with the same key
export const TICKET_STATS_QUERY_KEY = ['public-ticket-stats'] as const;

export function useTicketStats() {
  return useQuery({
    queryKey: TICKET_STATS_QUERY_KEY,
    queryFn: async () => {
      const tickets = await ticketService.getAllTickets();
      return calculateStats(tickets);
    },
    staleTime: 5 * 60 * 1000, // 5 min — avoids repeat fetches across components
    gcTime: 10 * 60 * 1000
  });
}
