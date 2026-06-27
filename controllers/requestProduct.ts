import type { Request, Response } from "express";
import { Types } from "mongoose";
import Product from "../models/Product.js";
import RequestProduct from "../models/RequestProduct.js";
import User from "../models/User.js";

export const requestProduct = async (req: Request, res: Response) => {
  try {
    const { productId, quantity, quantite } = req.body;
    const qty = Number(quantity ?? quantite);

    if (!req.user?.id) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    if (!productId || typeof productId !== "string" || !Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "productId est requis et doit être un id valide" });
    }

    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ message: "Quantité invalide" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    if (product.stock < qty) {
      return res.status(400).json({ message: "Quantité demandée supérieure au stock disponible" });
    }

    const requestProduct = await RequestProduct.create({
      userId: new Types.ObjectId(req.user.id),
      productId: product._id,
      quantity: qty,
    });

    return res.status(201).json({ message: "Demande de produit créée", requestProduct });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ message });
  }
};
export const getAllRequests = async (req: Request, res: Response) => {
  try {
    const requests = await RequestProduct.find()
      .populate("userId", "name email")
      .populate("productId", "name price stock")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    res.status(500).json({ message });
  }
};

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalRequests = await RequestProduct.countDocuments();
    const totalClients = await User.countDocuments({ role: "client" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    const stockSummary = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: "$stock" },
          outOfStock: {
            $sum: {
              $cond: [{ $lte: ["$stock", 0] }, 1, 0],
            },
          },
        },
      },
    ]);

    const quantitySummary = await RequestProduct.aggregate([
      {
        $group: {
          _id: null,
          totalRequestedQuantity: { $sum: "$quantity" },
        },
      },
    ]);

    const stockData = stockSummary[0] ?? { totalStock: 0, outOfStock: 0 };
    const quantityData = quantitySummary[0] ?? { totalRequestedQuantity: 0 };

    res.status(200).json({
      totalProducts,
      totalRequests,
      totalClients,
      totalAdmins,
      totalStock: stockData.totalStock,
      outOfStockProducts: stockData.outOfStock,
      totalRequestedQuantity: quantityData.totalRequestedQuantity,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ message });
  }
};