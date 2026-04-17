import { Router, type IRouter } from "express";
import { Order } from "../models/Order";
import { Customer } from "../models/Customer";
import { Product } from "../models/Product";
import {
  ListOrdersQueryParams,
  CreateOrderBody,
  GetOrderParams,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

let orderCounter = 1000;

function formatOrder(o: any) {
  return {
    id: orderCounter++,
    _mongoId: o._id.toString(),
    customerId: o.customerId ? 1 : null,
    customerName: o.customerName ?? null,
    status: o.status,
    total: o.total,
    itemCount: o.items.length,
    items: o.items.map((item: any) => ({
      id: 1,
      productId: 1,
      _mongoProductId: item.productId?.toString(),
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
    })),
    notes: o.notes ?? null,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}

router.get("/orders", async (req, res): Promise<void> => {
  const parsed = ListOrdersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const query: any = {};
  if (parsed.data.status) query.status = parsed.data.status;

  const orders = await Order.find(query).sort({ createdAt: -1 });
  res.json(orders.map(formatOrder));
});

router.post("/orders", async (req, res): Promise<void> => {
  const { items, customerId, notes } = req.body as {
    items: { productId: string | number; quantity: number }[];
    customerId?: string | number;
    notes?: string;
  };

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "items is required and must be non-empty" });
    return;
  }

  let customerName: string | undefined;
  if (customerId) {
    const customer = await Customer.findById(customerId.toString()).catch(() => null);
    if (customer) customerName = customer.name;
  }

  let total = 0;
  const orderItems = [];
  for (const item of items) {
    const product = await Product.findById(item.productId.toString()).catch(() => null);
    if (!product) {
      res.status(400).json({ error: `Product ${item.productId} not found` });
      return;
    }
    const lineTotal = product.price * item.quantity;
    total += lineTotal;
    orderItems.push({
      productId: product._id,
      productName: product.name,
      quantity: item.quantity,
      price: product.price,
    });

    await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
  }

  const order = await Order.create({
    customerId: customerId?.toString() ?? undefined,
    customerName,
    items: orderItems,
    total,
    notes,
    status: "pending",
  });

  res.status(201).json(formatOrder(order));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const order = await Order.findById(rawId).catch(() => null);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(formatOrder(order));
});

router.patch("/orders/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const order = await Order.findByIdAndUpdate(rawId, { status: parsed.data.status }, { new: true }).catch(() => null);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(formatOrder(order));
});

export default router;
