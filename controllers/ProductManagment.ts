import type { Request, Response } from "express";
import { Types } from "mongoose";
import Product from "../models/Product.js";
import {
  deleteProductImages,
  type ProductImage,
  uploadProductImages,
} from "../services/cloudinaryProductImages.js";

type ProductPayload = {
  name?: string;
  description?: string;
  price?: number;
  discount?: number;
  priceAfterDiscount?: number;
  images?: ProductImage[];
  category?: string;
  stock?: number;
};

const toNumber = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? undefined : numberValue;
};

const getUploadedFiles = (req: Request) => {
  const files = req.files as Express.Multer.File[] | undefined;

  if (!Array.isArray(files)) {
    return [];
  }

  return files;
};

const calculatePriceAfterDiscount = (price?: number, discount = 0) => {
  if (price === undefined) {
    return undefined;
  }

  const discountedPrice = price - (price * discount) / 100;
  return Math.round(discountedPrice * 100) / 100;
};

const hasBodyValue = (req: Request, key: string) => {
  const value = req.body[key];
  return value !== undefined && value !== null && value !== "";
};

const buildProductPayload = async (
  req: Request,
  options: { includeDefaults?: boolean } = {}
): Promise<ProductPayload> => {
  const price = toNumber(req.body.price);
  const discount = hasBodyValue(req, "discount")
    ? toNumber(req.body.discount)
    : options.includeDefaults
      ? 0
      : undefined;
  const stock = toNumber(req.body.stock);
  const images = await uploadProductImages(getUploadedFiles(req));
  const payload: ProductPayload = {};

  if (hasBodyValue(req, "name")) payload.name = req.body.name;
  if (hasBodyValue(req, "description")) payload.description = req.body.description;
  if (price !== undefined) payload.price = price;
  if (discount !== undefined) payload.discount = discount;
  if (price !== undefined) {
    payload.priceAfterDiscount = calculatePriceAfterDiscount(price, discount ?? 0);
  }
  if (images.length > 0) payload.images = images;
  if (hasBodyValue(req, "category")) payload.category = req.body.category;
  if (stock !== undefined) payload.stock = stock;

  return payload;
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const payload = await buildProductPayload(req, { includeDefaults: true });
    const product = await Product.create(payload);

    res.status(201).json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ message });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const filter = req.user?.role === "client" ? { stock: { $gt: 0 } } : {};
    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ message });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (Array.isArray(id) || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (Array.isArray(id) || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const oldProduct = await Product.findById(id);

    if (!oldProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const payload = await buildProductPayload(req);
    const price = payload.price ?? oldProduct.price;
    const discount = payload.discount ?? oldProduct.discount;

    payload.priceAfterDiscount = calculatePriceAfterDiscount(price, discount);

    if (payload.images && payload.images.length > 0) {
      await deleteProductImages(oldProduct.images);
    }

    const product = await Product.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (Array.isArray(id) || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await deleteProductImages(product.images);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ message });
  }
};
