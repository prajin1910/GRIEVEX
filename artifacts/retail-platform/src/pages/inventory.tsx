import { useListInventory, useGetInventoryAlerts } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Inventory() {
  const { data: inventory, isLoading } = useListInventory();
  const { data: alerts, isLoading: isLoadingAlerts } = useGetInventoryAlerts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
      </div>

      {/* Alerts */}
      <div className="grid md:grid-cols-2 gap-4">
        {isLoadingAlerts ? (
          <Skeleton className="h-24 w-full md:col-span-2" />
        ) : alerts && alerts.length > 0 ? (
          alerts.slice(0, 2).map((alert, i) => (
            <Card key={i} className={alert.severity === 'critical' ? 'border-destructive/50 bg-destructive/5' : 'border-amber-500/50 bg-amber-500/5'}>
              <CardContent className="p-4 flex gap-4">
                {alert.severity === 'critical' ? (
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                )}
                <div>
                  <div className="font-medium text-sm">{alert.productName} ({alert.sku})</div>
                  <div className="text-sm text-muted-foreground mt-1">{alert.recommendedAction}</div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : null}
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Restocked</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                </TableRow>
              ))
            ) : inventory && inventory.length > 0 ? (
              inventory.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>
                    <span className="font-medium">{item.currentStock}</span>
                    <span className="text-xs text-muted-foreground ml-2">/ {item.lowStockThreshold} threshold</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      item.status === 'healthy' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                      item.status === 'low' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      item.status === 'critical' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                      'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    }>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.lastRestockedAt ? new Date(item.lastRestockedAt).toLocaleDateString() : "-"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No inventory data found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}