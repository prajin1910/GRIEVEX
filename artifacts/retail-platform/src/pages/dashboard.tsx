import { useGetDashboardSummary, useGetSalesTrends, useGetRecentActivity, useGetTopProducts } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/format";
import { Activity, ArrowDownRight, ArrowUpRight, Box, CreditCard, DollarSign, Users } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: trends, isLoading: isLoadingTrends } = useGetSalesTrends({ period: "week" });
  const { data: activity, isLoading: isLoadingActivity } = useGetRecentActivity();
  const { data: topProducts, isLoading: isLoadingTopProducts } = useGetTopProducts();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={summary?.totalRevenue ? formatCurrency(summary.totalRevenue) : "$0"}
          trend={summary?.revenueGrowth}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          loading={isLoadingSummary}
        />
        <MetricCard
          title="Orders"
          value={summary?.totalOrders ? formatNumber(summary.totalOrders) : "0"}
          trend={summary?.ordersGrowth}
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
          loading={isLoadingSummary}
        />
        <MetricCard
          title="Customers"
          value={summary?.totalCustomers ? formatNumber(summary.totalCustomers) : "0"}
          trend={summary?.customersGrowth}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          loading={isLoadingSummary}
        />
        <MetricCard
          title="Avg. Order Value"
          value={summary?.averageOrderValue ? formatCurrency(summary.averageOrderValue) : "$0"}
          trend={0} // No trend for AOV in summary
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          loading={isLoadingSummary}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoadingTrends ? (
              <Skeleton className="h-[350px] w-full" />
            ) : trends && trends.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value}`} 
                  />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="var(--color-primary)" 
                    strokeWidth={2} 
                    dot={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                No trend data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingActivity ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : activity && activity.length > 0 ? (
              <div className="space-y-4">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      item.severity === 'error' ? 'bg-destructive/10 text-destructive' :
                      item.severity === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                      item.severity === 'success' ? 'bg-green-500/10 text-green-500' :
                      'bg-primary/10 text-primary'
                    }`}>
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No recent activity
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, icon, loading }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-[100px]" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {trend !== undefined && (
              <p className={`text-xs flex items-center ${trend >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                {trend > 0 ? <ArrowUpRight className="mr-1 h-4 w-4" /> : <ArrowDownRight className="mr-1 h-4 w-4" />}
                {Math.abs(trend)}% from last month
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}