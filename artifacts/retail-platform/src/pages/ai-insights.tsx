import { useGetDemandForecast, useGetPricingSuggestions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownRight, ArrowUpRight, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function AiInsights() {
  const { data: forecasts, isLoading: isLoadingForecasts } = useGetDemandForecast();
  const { data: suggestions, isLoading: isLoadingSuggestions } = useGetPricingSuggestions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
        <p className="text-muted-foreground">Actionable intelligence powered by machine learning.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Demand Forecasting</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoadingForecasts ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><CardContent className="p-6"><Skeleton className="h-24" /></CardContent></Card>
            ))
          ) : forecasts && forecasts.length > 0 ? (
            forecasts.map((forecast) => (
              <Card key={forecast.productId}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base line-clamp-1">{forecast.productName}</CardTitle>
                  <CardDescription>Confidence: {forecast.confidence}%</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <div className="text-2xl font-bold">{forecast.predictedDemand} units</div>
                      <div className="text-sm text-muted-foreground">Predicted 30d Demand</div>
                    </div>
                    <div className={`flex items-center text-sm font-medium ${
                      forecast.trend === 'rising' ? 'text-green-500' :
                      forecast.trend === 'declining' ? 'text-destructive' :
                      'text-muted-foreground'
                    }`}>
                      {forecast.trend === 'rising' ? <TrendingUp className="mr-1 h-4 w-4" /> :
                       forecast.trend === 'declining' ? <TrendingDown className="mr-1 h-4 w-4" /> :
                       <Minus className="mr-1 h-4 w-4" />}
                      {forecast.trend}
                    </div>
                  </div>
                  <div className="text-sm p-3 bg-muted rounded-md border">
                    <span className="font-semibold text-primary">Recommendation: </span>
                    {forecast.recommendation}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">No forecasts available</div>
          )}
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-semibold tracking-tight">Dynamic Pricing Suggestions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {isLoadingSuggestions ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}><CardContent className="p-6"><Skeleton className="h-24" /></CardContent></Card>
            ))
          ) : suggestions && suggestions.length > 0 ? (
            suggestions.map((suggestion) => {
              const diff = suggestion.suggestedPrice - suggestion.currentPrice;
              const isIncrease = diff > 0;
              
              return (
                <Card key={suggestion.productId}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base line-clamp-1">{suggestion.productName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Current Price</div>
                        <div className="text-lg font-medium">{formatCurrency(suggestion.currentPrice)}</div>
                      </div>
                      <div className="text-muted-foreground">→</div>
                      <div>
                        <div className="text-sm text-muted-foreground">Suggested Price</div>
                        <div className={`text-xl font-bold flex items-center ${isIncrease ? 'text-green-500' : 'text-blue-500'}`}>
                          {formatCurrency(suggestion.suggestedPrice)}
                          {isIncrease ? <ArrowUpRight className="ml-1 h-4 w-4" /> : <ArrowDownRight className="ml-1 h-4 w-4" />}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm border-t pt-4">
                      <div>
                        <span className="font-semibold">Reasoning: </span>
                        <span className="text-muted-foreground">{suggestion.reasoning}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Expected Impact: </span>
                        <span className="text-muted-foreground">{suggestion.expectedImpact}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">No pricing suggestions available</div>
          )}
        </div>
      </div>
    </div>
  );
}