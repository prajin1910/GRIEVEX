import { useGetProduct } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function ProductDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  
  const { data: product, isLoading } = useGetProduct(id, {
    query: { enabled: !!id }
  });

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-[400px]" /></div>;
  }

  if (!product) {
    return <div className="p-8 text-center">Product not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/products"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="font-semibold mb-1">Description</div>
              <p className="text-muted-foreground">{product.description || "No description provided."}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <div className="font-semibold mb-1">Price</div>
                <div className="text-2xl">{formatCurrency(product.price)}</div>
                {product.compareAtPrice && (
                  <div className="text-sm text-muted-foreground line-through">{formatCurrency(product.compareAtPrice)}</div>
                )}
              </div>
              <div>
                <div className="font-semibold mb-1">Stock</div>
                <div className="text-2xl">{product.stock} units</div>
                <div className="text-sm text-muted-foreground">Threshold: {product.lowStockThreshold}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Status</div>
              <div className="font-medium">{product.isActive ? "Active" : "Draft"}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">SKU</div>
              <div className="font-medium">{product.sku}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Category</div>
              <div className="font-medium">{product.categoryName || "-"}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Added On</div>
              <div className="font-medium">{new Date(product.createdAt).toLocaleDateString()}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}