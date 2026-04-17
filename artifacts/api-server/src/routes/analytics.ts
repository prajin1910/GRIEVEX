import { Router, type IRouter } from "express";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { Customer } from "../models/Customer";
import { Category } from "../models/Category";

const router: IRouter = Router();

router.get("/analytics/dashboard", async (_req, res): Promise<void> => {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const [allOrders, thisMonthOrders, lastMonthOrders, totalCustomers, thisMonthCustomers, lastMonthCustomers, totalProducts, products] =
    await Promise.all([
      Order.find({ status: { $ne: "cancelled" } }),
      Order.find({ createdAt: { $gte: thisMonth }, status: { $ne: "cancelled" } }),
      Order.find({ createdAt: { $gte: lastMonth, $lte: lastMonthEnd }, status: { $ne: "cancelled" } }),
      Customer.countDocuments(),
      Customer.countDocuments({ createdAt: { $gte: thisMonth } }),
      Customer.countDocuments({ createdAt: { $gte: lastMonth, $lte: lastMonthEnd } }),
      Product.countDocuments({ isActive: true }),
      Product.find({ isActive: true }),
    ]);

  const totalRevenue = thisMonthOrders.reduce((sum, o) => sum + o.total, 0);
  const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + o.total, 0);

  const lowStockAlerts = products.filter((p) => p.stock <= p.lowStockThreshold).length;
  const pendingOrders = await Order.countDocuments({ status: "pending" });

  const revenueGrowth = lastMonthRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
  const ordersGrowth = lastMonthOrders.length > 0 ? ((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100 : 0;
  const customersGrowth = lastMonthCustomers > 0 ? ((thisMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100 : 0;

  const averageOrderValue = thisMonthOrders.length > 0 ? totalRevenue / thisMonthOrders.length : 0;

  res.json({
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalOrders: thisMonthOrders.length,
    totalCustomers,
    totalProducts,
    revenueGrowth: Math.round(revenueGrowth * 10) / 10,
    ordersGrowth: Math.round(ordersGrowth * 10) / 10,
    customersGrowth: Math.round(customersGrowth * 10) / 10,
    lowStockAlerts,
    pendingOrders,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
  });
});

router.get("/analytics/sales-trends", async (req, res): Promise<void> => {
  const period = (req.query.period as string) ?? "month";
  const now = new Date();
  let startDate: Date;
  let groupFormat: string;

  if (period === "week") {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    groupFormat = "%Y-%m-%d";
  } else if (period === "quarter") {
    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    groupFormat = "%Y-%U";
  } else if (period === "year") {
    startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    groupFormat = "%Y-%m";
  } else {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    groupFormat = "%Y-%m-%d";
  }

  const trends = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate }, status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json(trends.map((t) => ({ date: t._id, revenue: Math.round(t.revenue * 100) / 100, orders: t.orders })));
});

router.get("/analytics/top-products", async (_req, res): Promise<void> => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const topSelling = await Order.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $ne: "cancelled" } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        productName: { $first: "$items.productName" },
        totalSold: { $sum: "$items.quantity" },
        totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 5 },
  ]);

  const result = await Promise.all(
    topSelling.map(async (item) => {
      const product = await Product.findById(item._id).catch(() => null);
      return {
        productId: 1,
        _mongoId: item._id?.toString() ?? "",
        productName: item.productName,
        imageUrl: product?.imageUrl ?? null,
        totalSold: item.totalSold,
        totalRevenue: Math.round(item.totalRevenue * 100) / 100,
        trend: "up" as const,
      };
    })
  );

  if (result.length === 0) {
    const products = await Product.find({ isActive: true }).sort({ reviewCount: -1 }).limit(5);
    return res.json(
      products.map((p) => ({
        productId: 1,
        _mongoId: p._id.toString(),
        productName: p.name,
        imageUrl: p.imageUrl ?? null,
        totalSold: p.reviewCount,
        totalRevenue: p.price * p.reviewCount,
        trend: "stable" as const,
      }))
    );
  }

  res.json(result);
});

router.get("/analytics/recent-activity", async (_req, res): Promise<void> => {
  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
  const lowStockProducts = await Product.find({ isActive: true, stock: { $lte: 10 } }).limit(3);
  const recentCustomers = await Customer.find().sort({ createdAt: -1 }).limit(2);

  let idCounter = 1;
  const activities = [
    ...recentOrders.map((o) => ({
      id: idCounter++,
      type: o.status === "shipped" ? "order_shipped" : "order_placed",
      title: o.status === "shipped" ? "Order Shipped" : "New Order Placed",
      description: `Order ${o._id.toString().slice(-6).toUpperCase()} — ₹${o.total.toFixed(2)}${o.customerName ? ` by ${o.customerName}` : ""}`,
      timestamp: o.createdAt.toISOString(),
      severity: "info",
    })),
    ...lowStockProducts.map((p) => ({
      id: idCounter++,
      type: "low_stock",
      title: "Low Stock Alert",
      description: `${p.name} is running low — only ${p.stock} units remaining`,
      timestamp: new Date().toISOString(),
      severity: p.stock === 0 ? "error" : "warning",
    })),
    ...recentCustomers.map((c) => ({
      id: idCounter++,
      type: "new_customer",
      title: "New Customer Registered",
      description: `${c.name} joined the platform`,
      timestamp: c.createdAt.toISOString(),
      severity: "success",
    })),
  ];

  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  res.json(activities.slice(0, 10));
});

router.get("/analytics/category-breakdown", async (_req, res): Promise<void> => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const orders = await Order.find({ createdAt: { $gte: thirtyDaysAgo }, status: { $ne: "cancelled" } });
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  const categories = await Category.find();
  const breakdown = await Promise.all(
    categories.map(async (cat) => {
      const products = await Product.find({ categoryId: cat._id });
      const productIds = products.map((p) => p._id.toString());

      let catRevenue = 0;
      let orderCount = 0;
      for (const order of orders) {
        const hasProduct = order.items.some((item) => productIds.includes(item.productId.toString()));
        if (hasProduct) {
          orderCount++;
          catRevenue += order.items
            .filter((item) => productIds.includes(item.productId.toString()))
            .reduce((sum, item) => sum + item.price * item.quantity, 0);
        }
      }

      return {
        categoryId: 1,
        _mongoId: cat._id.toString(),
        categoryName: cat.name,
        revenue: Math.round(catRevenue * 100) / 100,
        orderCount,
        percentage: totalRevenue > 0 ? Math.round((catRevenue / totalRevenue) * 1000) / 10 : 0,
      };
    })
  );

  res.json(breakdown.filter((b) => b.revenue > 0).sort((a, b) => b.revenue - a.revenue));
});

export default router;
