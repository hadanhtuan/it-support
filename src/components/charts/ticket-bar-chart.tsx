'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { userService } from '@/services';
import { ITSupport } from '@/lib/core/models';

interface ITSupportTicketData {
  name: string;
  resolved: number;
  itSupportId: string;
}

interface TicketBarChartProps {
  itSupportId?: string; // If provided, show stats for specific IT support
}

export function TicketBarChart({ itSupportId }: TicketBarChartProps): React.JSX.Element {
  const [chartData, setChartData] = useState<ITSupportTicketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        setIsLoading(true);

        // Fetch all IT Support users from Firestore
        const allITSupport = await userService.getAllITSupport();

        // Hard-coded ticket resolution data (TODO: Replace with actual data from tickets)
        const hardCodedResolvedCounts: Record<string, number> = {
          // You can update these values based on actual IT support IDs
          'default1': 45,
          'default2': 52,
          'default3': 38,
          'default4': 61,
          'default5': 48,
        };

        // Map IT Support to chart data
        const data: ITSupportTicketData[] = allITSupport.map((itSupport, index) => ({
          name: itSupport.fullname || `IT Support ${index + 1}`,
          resolved: hardCodedResolvedCounts[itSupport.id] || Math.floor(Math.random() * 60) + 20, // Random number between 20-80 if not in hardcoded data
          itSupportId: itSupport.id,
        }));

        setChartData(data);
      } catch (error) {
        console.error('Error fetching IT support data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketData();
  }, [itSupportId]);

  if (isLoading) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">IT Support - Tickets đã giải quyết</CardTitle>
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

  const totalResolved = chartData.reduce((sum, item) => sum + item.resolved, 0);
  const averageResolved = totalResolved > 0 && chartData.length > 0 ? (totalResolved / chartData.length).toFixed(1) : '0';
  const maxResolved = chartData.length > 0 ? Math.max(...chartData.map(d => d.resolved)) : 0;
  const topPerformer = chartData.find(d => d.resolved === maxResolved);

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-2xl font-bold">
          IT Support - Hiệu suất giải quyết ticket
        </CardTitle>
        <CardDescription className="text-base">
          Tổng số IT Support: <span className="font-semibold text-foreground">{chartData.length}</span> • Tổng tickets: <span className="font-semibold text-foreground">{totalResolved}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <ResponsiveContainer width="100%" height={380}>
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 80,
            }}
          >
            <defs>
              <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              angle={0}
              textAnchor="middle"
              height={80}
              stroke="hsl(var(--border))"
              interval={0}
            />
            <YAxis
              label={{
                value: 'Số lượng tickets',
                angle: -90,
                position: 'insideLeft',
                style: { fill: 'hsl(var(--muted-foreground))' }
              }}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              stroke="hsl(var(--border))"
            />
            <Tooltip
              formatter={(value: number | undefined) => value !== undefined ? [`${value} tickets`, 'Đã giải quyết'] : []}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              cursor={{ fill: 'hsl(var(--accent))', opacity: 0.1 }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Bar
              dataKey="resolved"
              fill="url(#colorResolved)"
              name="Tickets đã giải quyết"
              radius={[8, 8, 0, 0]}
              maxBarSize={80}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
