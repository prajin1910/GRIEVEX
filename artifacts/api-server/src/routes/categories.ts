import { Router, type IRouter } from "express";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { CreateCategoryBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/categories", async (_req, res): Promise<void> => {
  const categories = await Category.find().sort({ createdAt: -1 });
  const categoryIds = categories.map((c) => c._id);
  const counts = await Product.aggregate([
    { $match: { categoryId: { $in: categoryIds } } },
    { $group: { _id: "$categoryId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

  res.json(
    categories.map((c) => ({
      id: 1,
      _mongoId: c._id.toString(),
      name: c.name,
      description: c.description ?? null,
      productCount: countMap.get(c._id.toString()) ?? 0,
      createdAt: c.createdAt.toISOString(),
    }))
  );
});

router.post("/categories", async (req, res): Promise<void> => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const category = await Category.create(parsed.data);
  res.status(201).json({
    id: 1,
    _mongoId: category._id.toString(),
    name: category.name,
    description: category.description ?? null,
    productCount: 0,
    createdAt: category.createdAt.toISOString(),
  });
});

export default router;
