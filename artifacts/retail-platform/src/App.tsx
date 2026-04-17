import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/app-layout";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Categories from "@/pages/categories";
import Customers from "@/pages/customers";
import Orders from "@/pages/orders";
import Inventory from "@/pages/inventory";
import AiAssistant from "@/pages/ai-assistant";
import AiInsights from "@/pages/ai-insights";

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/products" component={Products} />
        <Route path="/products/:id" component={ProductDetail} />
        <Route path="/categories" component={Categories} />
        <Route path="/customers" component={Customers} />
        <Route path="/orders" component={Orders} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/ai-assistant" component={AiAssistant} />
        <Route path="/ai-insights" component={AiInsights} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
