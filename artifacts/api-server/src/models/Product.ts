import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  categoryId?: mongoose.Types.ObjectId;
  sku: string;
  imageUrl?: string;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
  rating?: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    sku: { type: String, required: true, unique: true },
    imageUrl: { type: String },
    stock: { type: Number, required: true, default: 0 },
    lowStockThreshold: { type: Number, required: true, default: 10 },
    isActive: { type: Boolean, required: true, default: true },
    rating: { type: Number },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
