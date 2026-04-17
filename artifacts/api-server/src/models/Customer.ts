import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    address: { type: String },
  },
  { timestamps: true }
);

export const Customer = mongoose.model<ICustomer>("Customer", CustomerSchema);
