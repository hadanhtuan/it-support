'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { TicketCategory } from '@/lib/core/models';
import { HardDrive, Monitor, Wifi, User, Printer, Mail, HelpCircle } from 'lucide-react';
import Link from 'next/link';

const categoryIcons: Record<TicketCategory, React.ComponentType<{ className?: string }>> = {
  [TicketCategory.HARDWARE]: HardDrive,
  [TicketCategory.SOFTWARE]: Monitor,
  [TicketCategory.NETWORK]: Wifi,
  [TicketCategory.ACCOUNT]: User,
  [TicketCategory.PRINTER]: Printer,
  [TicketCategory.EMAIL]: Mail,
  [TicketCategory.OTHER]: HelpCircle
};

export default function SupportCategories(): React.JSX.Element {
  const { t } = useTranslation();

  const getCategoryColors = (category: TicketCategory) => {
    switch (category) {
      case TicketCategory.HARDWARE:
        return { bg: 'bg-slate-100', text: 'text-slate-600' };
      case TicketCategory.SOFTWARE:
        return { bg: 'bg-blue-100', text: 'text-blue-600' };
      case TicketCategory.NETWORK:
        return { bg: 'bg-green-100', text: 'text-green-600' };
      case TicketCategory.ACCOUNT:
        return { bg: 'bg-purple-100', text: 'text-purple-600' };
      case TicketCategory.PRINTER:
        return { bg: 'bg-cyan-100', text: 'text-cyan-600' };
      case TicketCategory.EMAIL:
        return { bg: 'bg-orange-100', text: 'text-orange-600' };
      case TicketCategory.OTHER:
        return { bg: 'bg-gray-100', text: 'text-gray-600' };
      default:
        return { bg: 'bg-primary/10', text: 'text-primary' };
    }
  };

  return (
    <section className='container py-16'>
      <div className='text-center mb-12'>
        <h2 className='text-3xl font-bold mb-4'>Danh mục hỗ trợ</h2>
        <p className='text-muted-foreground max-w-2xl mx-auto'>
          Chúng tôi cung cấp hỗ trợ toàn diện cho tất cả các vấn đề công nghệ thông tin
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {Object.values(TicketCategory).map((category) => {
          const Icon = categoryIcons[category];
          const colors = getCategoryColors(category);
          return (
            <Card key={category} className='text-center hover:shadow-lg transition-shadow flex flex-col'>
              <CardHeader className='flex-1'>
                <div className={`mx-auto mb-4 p-4 ${colors.bg} rounded-full w-fit`}>
                  <Icon className={`h-8 w-8 ${colors.text}`} />
                </div>
                <CardTitle className='text-lg'>{t(`ticketCategory.${category}`)}</CardTitle>
                <CardDescription className='min-h-[3rem]'>{getCategoryDescription(category)}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className='w-full'>
                  <Link href={`/user/create-ticket?category=${category}`}>Tạo phiếu hỗ trợ</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function getCategoryDescription(category: TicketCategory): string {
  switch (category) {
    case TicketCategory.HARDWARE:
      return 'Máy tính, linh kiện, thiết bị ngoại vi';
    case TicketCategory.SOFTWARE:
      return 'Ứng dụng, hệ điều hành, cài đặt phần mềm';
    case TicketCategory.NETWORK:
      return 'Internet, WiFi, kết nối mạng';
    case TicketCategory.ACCOUNT:
      return 'Tài khoản người dùng, quyền truy cập';
    case TicketCategory.PRINTER:
      return 'Máy in, máy photocopy, thiết bị văn phòng';
    case TicketCategory.EMAIL:
      return 'Thiết lập email, hộp thư, gửi nhận email';
    case TicketCategory.OTHER:
      return 'Các vấn đề khác không thuộc danh mục trên';
    default:
      return '';
  }
}
