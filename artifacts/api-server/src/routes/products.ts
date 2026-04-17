import { Router, type IRouter } from "express";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import {
  ListProductsQueryParams,
  CreateProductBody,
  UpdateProductBody,
} from "@workspace/api-zod";
import { mongoIdToInt } from "../lib/mongoId";

const router: IRouter = Router();

function formatProduct(p: any, categoryName?: string) {
  return {
    id: mongoIdToInt(p._id.toString()),
    _mongoId: p._id.toString(),
    name: p.name,
    description: p.description ?? null,
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? null,
    categoryId: p.categoryId ? 1 : null,
    categoryName: categoryName ?? null,
    sku: p.sku,
    imageUrl: p.imageUrl ?? null,
    stock: p.stock,
    lowStockThreshold: p.lowStockThreshold,
    isActive: p.isActive,
    rating: p.rating ?? null,
    reviewCount: p.reviewCount,
    createdAt: p.createdAt?.toISOString(),
    updatedAt: p.updatedAt?.toISOString(),
  };
}

router.get("/products", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { search, inStock } = parsed.data;

  const query: any = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
    ];
  }
  if (parsed.data.minPrice !== undefined) query.price = { $gte: parsed.data.minPrice };
  if (parsed.data.maxPrice !== undefined) query.price = { ...query.price, $lte: parsed.data.maxPrice };
  if (inStock !== undefined) {
    query.stock = inStock ? { $gt: 0 } : 0;
  }

  const products = await Product.find(query).populate("categoryId").sort({ createdAt: -1 });
  const categoryMap = new Map<string, string>();
  const cats = await Category.find();
  cats.forEach((c) => categoryMap.set(c._id.toString(), c.name));

  res.json(products.map((p) => formatProduct(p, p.categoryId ? categoryMap.get((p.categoryId as any).toString()) : undefined)));
});

router.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const product = await Product.create(parsed.data);
  res.status(201).json(formatProduct(product));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const product = await Product.findById(rawId).catch(() => null);
  if (!product) {
    const productBySku = await Product.findOne({ sku: rawId });
    if (!productBySku) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(formatProduct(productBySku));
    return;
  }
  res.json(formatProduct(product));
});

router.patch("/products/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const product = await Product.findByIdAndUpdate(rawId, parsed.data, { new: true }).catch(() => null);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(formatProduct(product));
});

router.delete("/products/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const product = await Product.findByIdAndDelete(rawId).catch(() => null);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
