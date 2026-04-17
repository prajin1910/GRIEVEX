import { connectMongoDB } from "./mongodb";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { Customer } from "../models/Customer";
import { Order } from "../models/Order";
import { logger } from "./logger";

async function seed() {
  await connectMongoDB();

  const existingProducts = await Product.countDocuments();
  if (existingProducts > 0) {
    logger.info("Database already seeded, skipping");
    return;
  }

  logger.info("Seeding database...");

  const categories = await Category.insertMany([
    { name: "Electronics", description: "Phones, laptops, tablets and accessories" },
    { name: "Clothing", description: "Fashion for men, women and kids" },
    { name: "Home & Kitchen", description: "Appliances, furniture and decor" },
    { name: "Sports & Fitness", description: "Gym equipment, outdoor gear and sportswear" },
    { name: "Books", description: "Fiction, non-fiction, educational and more" },
  ]);

  const [electronics, clothing, homeKitchen, sports, books] = categories;

  const products = await Product.insertMany([
    { name: "Samsung Galaxy S24 Ultra", description: "Latest flagship smartphone with 200MP camera", price: 134999, compareAtPrice: 149999, categoryId: electronics._id, sku: "ELEC-001", stock: 45, lowStockThreshold: 10, isActive: true, rating: 4.8, reviewCount: 1247 },
    { name: "Apple iPhone 15 Pro", description: "A17 Pro chip, titanium design, ProRes video", price: 129999, compareAtPrice: null, categoryId: electronics._id, sku: "ELEC-002", stock: 8, lowStockThreshold: 10, isActive: true, rating: 4.9, reviewCount: 2103 },
    { name: "OnePlus 12", description: "Snapdragon 8 Gen 3, Hasselblad cameras", price: 64999, compareAtPrice: 69999, categoryId: electronics._id, sku: "ELEC-003", stock: 62, lowStockThreshold: 15, isActive: true, rating: 4.6, reviewCount: 789 },
    { name: "Sony WH-1000XM5", description: "Industry-leading noise cancellation headphones", price: 26999, compareAtPrice: 34990, categoryId: electronics._id, sku: "ELEC-004", stock: 3, lowStockThreshold: 8, isActive: true, rating: 4.9, reviewCount: 3421 },
    { name: "MacBook Air M3", description: "15-inch display, Apple M3 chip, 18hr battery", price: 149900, compareAtPrice: null, categoryId: electronics._id, sku: "ELEC-005", stock: 22, lowStockThreshold: 5, isActive: true, rating: 4.7, reviewCount: 654 },
    { name: "Levi's 501 Original Jeans", description: "Classic straight fit, authentic denim", price: 3999, compareAtPrice: 4999, categoryId: clothing._id, sku: "CLTH-001", stock: 120, lowStockThreshold: 20, isActive: true, rating: 4.5, reviewCount: 567 },
    { name: "Nike Air Max 270", description: "Lightweight running shoes with Max Air cushioning", price: 11995, compareAtPrice: 13995, categoryId: clothing._id, sku: "CLTH-002", stock: 0, lowStockThreshold: 15, isActive: true, rating: 4.6, reviewCount: 892 },
    { name: "Adidas Ultraboost 23", description: "Energy-returning Boost midsole for runners", price: 14999, compareAtPrice: null, categoryId: clothing._id, sku: "CLTH-003", stock: 35, lowStockThreshold: 10, isActive: true, rating: 4.7, reviewCount: 445 },
    { name: "Philips Air Fryer XXL", description: "6.2L capacity, rapid air technology, 7 presets", price: 14995, compareAtPrice: 19995, categoryId: homeKitchen._id, sku: "HOME-001", stock: 28, lowStockThreshold: 8, isActive: true, rating: 4.4, reviewCount: 1123 },
    { name: "Instant Pot Duo 7-in-1", description: "Pressure cooker, slow cooker, rice cooker and more", price: 8999, compareAtPrice: 10999, categoryId: homeKitchen._id, sku: "HOME-002", stock: 15, lowStockThreshold: 10, isActive: true, rating: 4.6, reviewCount: 2341 },
    { name: "Dyson V15 Detect", description: "Laser dust detection, powerful suction vacuum", price: 49900, compareAtPrice: null, categoryId: homeKitchen._id, sku: "HOME-003", stock: 12, lowStockThreshold: 5, isActive: true, rating: 4.8, reviewCount: 432 },
    { name: "Decathlon Treadmill T540F", description: "Foldable treadmill, 12kmph max speed, Bluetooth", price: 39999, compareAtPrice: 49999, categoryId: sports._id, sku: "SPRT-001", stock: 7, lowStockThreshold: 5, isActive: true, rating: 4.3, reviewCount: 234 },
    { name: "Yoga Mat Premium 6mm", description: "Anti-slip, eco-friendly TPE material, carrying strap", price: 1299, compareAtPrice: 1999, categoryId: sports._id, sku: "SPRT-002", stock: 200, lowStockThreshold: 30, isActive: true, rating: 4.5, reviewCount: 1567 },
    { name: "The Alchemist - Paulo Coelho", description: "Bestselling philosophical novel about following dreams", price: 299, compareAtPrice: 399, categoryId: books._id, sku: "BOOK-001", stock: 150, lowStockThreshold: 25, isActive: true, rating: 4.7, reviewCount: 8923 },
    { name: "Atomic Habits - James Clear", description: "Proven framework for building good habits", price: 499, compareAtPrice: 699, categoryId: books._id, sku: "BOOK-002", stock: 89, lowStockThreshold: 20, isActive: true, rating: 4.9, reviewCount: 12456 },
  ]);

  const customers = await Customer.insertMany([
    { name: "Priya Sharma", email: "priya.sharma@email.com", phone: "+91-9876543210", address: "42, MG Road, Bengaluru, Karnataka 560001" },
    { name: "Rahul Verma", email: "rahul.verma@email.com", phone: "+91-9123456789", address: "15, Connaught Place, New Delhi 110001" },
    { name: "Ananya Gupta", email: "ananya.gupta@email.com", phone: "+91-8765432109", address: "7, Marine Drive, Mumbai, Maharashtra 400020" },
    { name: "Arjun Nair", email: "arjun.nair@email.com", phone: "+91-7654321098", address: "23, Park Street, Kolkata, West Bengal 700016" },
    { name: "Kavya Reddy", email: "kavya.reddy@email.com", phone: "+91-9988776655", address: "8, Banjara Hills, Hyderabad, Telangana 500034" },
  ]);

  const [priya, rahul, ananya, arjun, kavya] = customers;

  const pastDate = (daysAgo: number) => new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

  await Order.insertMany([
    {
      customerId: priya._id, customerName: priya.name, status: "delivered",
      items: [{ productId: products[0]._id, productName: products[0].name, quantity: 1, price: products[0].price }, { productId: products[3]._id, productName: products[3].name, quantity: 1, price: products[3].price }],
      total: products[0].price + products[3].price, createdAt: pastDate(25), updatedAt: pastDate(20),
    },
    {
      customerId: rahul._id, customerName: rahul.name, status: "shipped",
      items: [{ productId: products[4]._id, productName: products[4].name, quantity: 1, price: products[4].price }],
      total: products[4].price, createdAt: pastDate(3), updatedAt: pastDate(2),
    },
    {
      customerId: ananya._id, customerName: ananya.name, status: "processing",
      items: [{ productId: products[5]._id, productName: products[5].name, quantity: 2, price: products[5].price }, { productId: products[8]._id, productName: products[8].name, quantity: 1, price: products[8].price }],
      total: products[5].price * 2 + products[8].price, createdAt: pastDate(1), updatedAt: pastDate(1),
    },
    {
      customerId: arjun._id, customerName: arjun.name, status: "pending",
      items: [{ productId: products[11]._id, productName: products[11].name, quantity: 1, price: products[11].price }],
      total: products[11].price, createdAt: pastDate(0), updatedAt: pastDate(0),
    },
    {
      customerId: kavya._id, customerName: kavya.name, status: "delivered",
      items: [{ productId: products[13]._id, productName: products[13].name, quantity: 3, price: products[13].price }, { productId: products[14]._id, productName: products[14].name, quantity: 2, price: products[14].price }],
      total: products[13].price * 3 + products[14].price * 2, createdAt: pastDate(15), updatedAt: pastDate(12),
    },
    {
      customerId: priya._id, customerName: priya.name, status: "delivered",
      items: [{ productId: products[9]._id, productName: products[9].name, quantity: 1, price: products[9].price }],
      total: products[9].price, createdAt: pastDate(10), updatedAt: pastDate(8),
    },
    {
      customerId: rahul._id, customerName: rahul.name, status: "delivered",
      items: [{ productId: products[12]._id, productName: products[12].name, quantity: 2, price: products[12].price }, { productId: products[7]._id, productName: products[7].name, quantity: 1, price: products[7].price }],
      total: products[12].price * 2 + products[7].price, createdAt: pastDate(20), updatedAt: pastDate(16),
    },
    {
      customerId: ananya._id, customerName: ananya.name, status: "cancelled",
      items: [{ productId: products[6]._id, productName: products[6].name, quantity: 1, price: products[6].price }],
      total: products[6].price, createdAt: pastDate(5), updatedAt: pastDate(5),
    },
  ]);

  logger.info("Database seeded successfully!");
}

seed().then(() => process.exit(0)).catch((err) => { logger.error({ err }, "Seed failed"); process.exit(1); });
