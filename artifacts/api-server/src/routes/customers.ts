import { Router, type IRouter } from "express";
import { Customer } from "../models/Customer";
import { Order } from "../models/Order";
import { ListCustomersQueryParams, CreateCustomerBody, GetCustomerParams } from "@workspace/api-zod";

const router: IRouter = Router();

async function formatCustomer(c: any) {
  const orders = await Order.find({ customerId: c._id });
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const lastOrder = orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  return {
    id: 1,
    _mongoId: c._id.toString(),
    name: c.name,
    email: c.email,
    phone: c.phone ?? null,
    address: c.address ?? null,
    totalOrders: orders.length,
    totalSpent,
    lastOrderAt: lastOrder ? lastOrder.createdAt.toISOString() : null,
    createdAt: c.createdAt.toISOString(),
  };
}

router.get("/customers", async (req, res): Promise<void> => {
  const parsed = ListCustomersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const query: any = {};
  if (parsed.data.search) {
    query.$or = [
      { name: { $regex: parsed.data.search, $options: "i" } },
      { email: { $regex: parsed.data.search, $options: "i" } },
    ];
  }
  const customers = await Customer.find(query).sort({ createdAt: -1 });
  const result = await Promise.all(customers.map(formatCustomer));
  res.json(result);
});

router.post("/customers", async (req, res): Promise<void> => {
  const parsed = CreateCustomerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const customer = await Customer.create(parsed.data);
  res.status(201).json(await formatCustomer(customer));
});

router.get("/customers/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const customer = await Customer.findById(rawId).catch(() => null);
  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }
  res.json(await formatCustomer(customer));
});

export default router;
