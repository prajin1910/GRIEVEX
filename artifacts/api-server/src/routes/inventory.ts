import { Router, type IRouter } from "express";
import { Product } from "../models/Product";
import { UpdateInventoryBody } from "@workspace/api-zod";
import { mongoIdToInt } from "../lib/mongoId";

const router: IRouter = Router();

function getInventoryStatus(stock: number, threshold: number): "healthy" | "low" | "critical" | "overstock" {
  if (stock === 0) return "critical";
  if (stock <= threshold * 0.5) return "critical";
  if (stock <= threshold) return "low";
  if (stock >= threshold * 10) return "overstock";
  return "healthy";
}

function formatInventoryItem(p: any) {
  return {
    productId: 1,
    _mongoId: p._id.toString(),
    productName: p.name,
    sku: p.sku,
    currentStock: p.stock,
    lowStockThreshold: p.lowStockThreshold,
    status: getInventoryStatus(p.stock, p.lowStockThreshold),
    lastRestockedAt: null,
  };
}

router.get("/inventory", async (_req, res): Promise<void> => {
  const products = await Product.find({ isActive: true }).sort({ stock: 1 });
  res.json(products.map(formatInventoryItem));
});

router.get("/inventory/alerts", async (_req, res): Promise<void> => {
  const products = await Product.find({ isActive: true });
  const alerts = [];

  for (const p of products) {
    if (p.stock === 0) {
      alerts.push({
        productId: 1,
        _mongoId: p._id.toString(),
        productName: p.name,
        sku: p.sku,
        currentStock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        alertType: "out_of_stock",
        severity: "critical",
        recommendedAction: `Immediately restock ${p.name} — currently out of stock`,
      });
    } else if (p.stock <= p.lowStockThreshold * 0.5) {
      alerts.push({
        productId: 1,
        _mongoId: p._id.toString(),
        productName: p.name,
        sku: p.sku,
        currentStock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        alertType: "low_stock",
        severity: "critical",
        recommendedAction: `Restock ${p.name} urgently — only ${p.stock} units left`,
      });
    } else if (p.stock <= p.lowStockThreshold) {
      alerts.push({
        productId: 1,
        _mongoId: p._id.toString(),
        productName: p.name,
        sku: p.sku,
        currentStock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        alertType: "low_stock",
        severity: "warning",
        recommendedAction: `Consider restocking ${p.name} soon — stock at ${p.stock} units`,
      });
    } else if (p.stock >= p.lowStockThreshold * 10) {
      alerts.push({
        productId: 1,
        _mongoId: p._id.toString(),
        productName: p.name,
        sku: p.sku,
        currentStock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        alertType: "overstock",
        severity: "warning",
        recommendedAction: `Consider running a promotion — ${p.name} has ${p.stock} units in stock`,
      });
    }
  }

  res.json(alerts);
});

router.patch("/inventory/:productId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const parsed = UpdateInventoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { quantity, operation } = parsed.data;
  let update: any;
  if (operation === "set") update = { $set: { stock: quantity } };
  else if (operation === "add") update = { $inc: { stock: quantity } };
  else update = { $inc: { stock: -quantity } };

  const product = await Product.findByIdAndUpdate(rawId, update, { new: true }).catch(() => null);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(formatInventoryItem(product));
});

export default router;
