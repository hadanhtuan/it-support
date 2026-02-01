'use client';

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TicketCategory } from '@/lib/core/models';
import { useRouter } from 'next/navigation';

interface TicketData {
  name: string;
  value: number;
  color: string;
  category: TicketCategory;
}

export function TicketDonutChart(): React.JSX.Element {
  const router = useRouter();
  const [chartData, setChartData] = useState<TicketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState('');

  const handleChartClick = (category: TicketCategory) => {
    router.push(`/tickets?category=${category}`);
  };

  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        setIsLoading(true);

        // Get current month info
        const now = new Date();
        const monthName = now.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
        setCurrentMonth(monthName);

        // Fake/Mock data for demonstration
        const data: TicketData[] = [
          {
            name: 'Sự cố về mạng',
            value: 45,
            color: '#22c55e', // green
            category: TicketCategory.NETWORK,
          },
          {
            name: 'Sự cố về phần mềm',
            value: 32,
            color: '#3b82f6', // blue
            category: TicketCategory.SOFTWARE,
          },
          {
            name: 'Phần cứng',
            value: 23,
            color: '#6b7280', // gray
            category: TicketCategory.HARDWARE,
          },
        ];

        setChartData(data);
      } catch (error) {
        console.error('Error fetching ticket data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketData();
  }, []);

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="font-bold text-base"
        style={{ fontSize: '16px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (isLoading) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Phân loại sự cố</CardTitle>
          <CardDescription>Đang tải dữ liệu...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[450px]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Đang tải thống kê...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalTickets = chartData.reduce((sum, item) => sum + item.value, 0);

  if (totalTickets === 0) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Phân loại sự cố</CardTitle>
          <CardDescription>{currentMonth}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[450px]">
          <div className="text-center">
            <p className="text-muted-foreground">Chưa có dữ liệu sự cố trong tháng này</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-xl border-0 bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="space-y-2 pb-4">
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Phân loại sự cố
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          {currentMonth} • <span className="font-semibold text-foreground">{totalTickets}</span> tickets
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-8">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
          {/* Chart Section */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <ResponsiveContainer width="100%" height={500}>
              <PieChart>
                <defs>
                  <filter id="shadow" height="200%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15"/>
                  </filter>
                </defs>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={180}
                  innerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  strokeWidth={0}
                  paddingAngle={3}
                  filter="url(#shadow)"
                  onClick={(data) => handleChartClick(data.category)}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number | undefined) => value !== undefined ? [`${value} tickets`, 'Số lượng'] : []}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.15)',
                    padding: '12px 16px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend & Stats Section */}
          <div className="w-full lg:w-1/2 space-y-4">
            {chartData.map((item, index) => (
              <div
                key={index}
                onClick={() => handleChartClick(item.category)}
                className="group relative p-6 rounded-2xl border-2 hover:shadow-lg transition-all duration-300 cursor-pointer bg-card"
                style={{ borderColor: `${item.color}40` }}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl transition-all duration-300 group-hover:w-2"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex items-center justify-between ml-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-4 h-4 rounded-full shadow-lg"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {((item.value / totalTickets) * 100).toFixed(1)}% của tổng số
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-3xl font-bold transition-transform duration-300 group-hover:scale-110"
                      style={{ color: item.color }}
                    >
                      {item.value}
                    </p>
                    <p className="text-xs text-muted-foreground">tickets</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
