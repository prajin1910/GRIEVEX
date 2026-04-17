import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  customerId?: mongoose.Types.ObjectId;
  customerName?: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: IOrderItem[];
  total: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: true }
);

const OrderSchema = new Schema<IOrder>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    items: { type: [OrderItemSchema], required: true },
    total: { type: Number, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
