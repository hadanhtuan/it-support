'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Server, Network, Shield, Monitor, Database, Users } from 'lucide-react';
import { useTicketStats } from '@/hooks/use-ticket-stats';
import { TicketStatus } from '@/lib/core/models';

const businessServices = [
  {
    icon: Server,
    title: 'Quản trị hệ thống Server',
    description: 'Giám sát và bảo trì toàn bộ hệ thống máy chủ, đảm bảo hoạt động liên tục.',
    bg: 'bg-blue-100',
    text: 'text-blue-600'
  },
  {
    icon: Network,
    title: 'Triển khai hạ tầng mạng',
    description: 'Cài đặt thiết bị mạng, switch, fiber và cáp theo tiêu chuẩn doanh nghiệp.',
    bg: 'bg-blue-100',
    text: 'text-blue-600'
  },
  {
    icon: Shield,
    title: 'Firewall & Security',
    description: 'Quản lý tường lửa, chặn xâm nhập và bảo vệ hệ thống với Fortinet.',
    bg: 'bg-blue-100',
    text: 'text-blue-600'
  },
  {
    icon: Monitor,
    title: 'Monitoring hệ thống',
    description: 'Giám sát cảnh báo theo thời gian thực, phát hiện sự cố sớm.',
    bg: 'bg-blue-100',
    text: 'text-blue-600'
  },
  {
    icon: Database,
    title: 'Backup dữ liệu',
    description: 'Sao lưu dữ liệu an toàn lên đám mây và thiết bị NAS theo lịch định kỳ.',
    bg: 'bg-blue-100',
    text: 'text-blue-600'
  },
  {
    icon: Users,
    title: 'IT Thuê Ngoài',
    description: 'Chuyên gia IT theo ca, hỗ trợ on-site và remote cho doanh nghiệp.',
    bg: 'bg-blue-100',
    text: 'text-blue-600'
  }
];

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  [TicketStatus.IN_PROGRESS]: { label: 'Đang xử lý', className: 'bg-blue-100 text-blue-700' },
  [TicketStatus.OPEN]: { label: 'Mở', className: 'bg-gray-100 text-gray-700' },
  [TicketStatus.RESOLVED]: { label: 'Hoàn thành', className: 'bg-green-100 text-green-700' },
  [TicketStatus.CLOSED]: { label: 'Đã đóng', className: 'bg-green-100 text-green-700' },
  [TicketStatus.WAITING_FOR_CUSTOMER]: { label: 'Chờ phản hồi', className: 'bg-yellow-100 text-yellow-700' },
  [TicketStatus.CANCELLED]: { label: 'Huỷ', className: 'bg-red-100 text-red-700' }
};

function buildGradient(types: { percent: number; color: string }[]): string {
  let cumulative = 0;
  return types
    .map((t) => {
      const start = cumulative;
      cumulative += t.percent;
      return `${t.color} ${start}% ${cumulative}%`;
    })
    .join(', ');
}

function formatDate(ts: unknown): string {
  if (!ts) return '';
  try {
    const date = typeof ts === 'object' && ts !== null && 'toDate' in ts
      ? (ts as { toDate: () => Date }).toDate()
      : new Date(ts as string | number);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return '';
  }
}

export function ITScope(): React.JSX.Element {
  // Shared query — only ONE Firestore request is made (React Query deduplicates)
  const { data, isLoading } = useTicketStats();

  return (
    <section className='container py-12'>
      <div className='flex flex-col lg:flex-row gap-8'>
        {/* Left: Business services (static content, no fetch needed) */}
        <div className='w-full lg:w-3/5'>
          <motion.h2
            className='text-2xl font-bold mb-6'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Dịch Vụ IT Cho Doanh Nghiệp
          </motion.h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {businessServices.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  className='border rounded-xl p-4 flex flex-col gap-3 bg-background hover:shadow-md transition-shadow'
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <div className='flex items-start gap-3'>
                    <div className={`p-2.5 rounded-lg ${service.bg} flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${service.text}`} />
                    </div>
                    <div>
                      <h3 className='font-semibold text-sm'>{service.title}</h3>
                      <p className='text-xs text-muted-foreground mt-0.5'>{service.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right panel — data from shared useTicketStats hook */}
        <div className='w-full lg:w-2/5 flex flex-col gap-6'>
          {/* Incident types donut chart */}
          <motion.div
            className='border rounded-xl p-5 bg-background'
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className='font-bold text-base mb-4'>Loại Sự Cố</h3>
            {isLoading ? (
              <div className='flex items-center gap-6'>
                <div className='w-24 h-24 rounded-full bg-muted animate-pulse flex-shrink-0' />
                <div className='space-y-2 flex-1'>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className='h-4 bg-muted animate-pulse rounded' />
                  ))}
                </div>
              </div>
            ) : (
              <div className='flex items-center gap-6'>
                <div
                  className='w-24 h-24 rounded-full flex-shrink-0'
                  style={{
                    background:
                      data && data.categoryBreakdown.length > 0
                        ? `conic-gradient(${buildGradient(data.categoryBreakdown)})`
                        : '#e5e7eb',
                    mask: 'radial-gradient(circle at center, transparent 38%, black 39%)',
                    WebkitMask: 'radial-gradient(circle at center, transparent 38%, black 39%)'
                  }}
                />
                <div className='space-y-2 flex-1'>
                  {(data?.categoryBreakdown ?? []).map((t) => (
                    <div key={t.label} className='flex items-center justify-between text-sm'>
                      <div className='flex items-center gap-2'>
                        <span
                          className='w-2.5 h-2.5 rounded-full inline-block flex-shrink-0'
                          style={{ background: t.color }}
                        />
                        <span className='text-muted-foreground'>{t.label}</span>
                      </div>
                      <span className='font-semibold'>{t.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Recent tickets */}
          <motion.div
            className='border rounded-xl p-5 bg-background'
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className='flex items-center justify-between mb-4'>
              <h3 className='font-bold text-base'>Ticket Mới Nhất</h3>
              <Link href='/user/tickets' className='text-xs text-blue-500 hover:underline'>
                Xem tất cả
              </Link>
            </div>
            <div className='space-y-3'>
              {isLoading
                ? [1, 2, 3].map((i) => (
                    <div key={i} className='flex items-center justify-between gap-2'>
                      <div className='space-y-1 flex-1'>
                        <div className='h-4 bg-muted animate-pulse rounded w-3/4' />
                        <div className='h-3 bg-muted animate-pulse rounded w-1/2' />
                      </div>
                      <div className='h-5 w-20 bg-muted animate-pulse rounded-full' />
                    </div>
                  ))
                : (data?.recentTickets ?? []).map((ticket) => {
                    const statusMeta = STATUS_LABEL[ticket.status] ?? {
                      label: ticket.status,
                      className: 'bg-gray-100 text-gray-700'
                    };
                    return (
                      <div key={ticket.id} className='flex items-center justify-between gap-2'>
                        <div className='min-w-0'>
                          <div className='text-sm font-medium truncate'>
                            <span className='text-muted-foreground'>#{ticket.id.slice(-4)}</span>{' '}
                            {ticket.title}
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            {formatDate(ticket.createdAt)}
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusMeta.className}`}
                        >
                          {statusMeta.label}
                        </span>
                      </div>
                    );
                  })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
