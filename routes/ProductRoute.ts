import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  getProductByCategory,
  searchProducts,
} from "../controllers/ProductManagment.js";
import { requestProduct, getAllRequests, getAdminStats } from "../controllers/requestProduct.js";
import { protect, cheakRoles } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/upload.js";

const router = Router();

router.post("/addProduct", protect, cheakRoles("admin"), upload.array("images", 5), createProduct);
router.post("/requestProduct", protect, requestProduct);
router.get("/allProducts", protect, getAllProducts);
router.get("/getProduct/:id", protect, getProduct);
router.get("/getProductByCategory/:category", protect, getProductByCategory);
router.put("/updateProduct/:id", protect, cheakRoles("admin"), upload.array("images", 5), updateProduct);
router.delete("/deleteProduct/:id", protect, cheakRoles("admin"), deleteProduct);
router.get("/searchProducts", protect, searchProducts);
router.get("/allRequests", protect, cheakRoles("admin"), getAllRequests);
router.get("/adminStats", protect, cheakRoles("admin"), getAdminStats);
export default router;
