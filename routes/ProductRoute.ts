import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  updateProduct,
} from "../controllers/ProductManagment.js";
import { protect, cheakRoles } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/upload.js";

const router = Router();

router.post("/addProduct", protect, cheakRoles("admin"), upload.array("images", 5), createProduct);
router.get("/allProducts", protect, getAllProducts);
router.get("/getProduct/:id", protect, getProduct);
router.put("/updateProduct/:id", protect, cheakRoles("admin"), upload.array("images", 5), updateProduct);
router.delete("/deleteProduct/:id", protect, cheakRoles("admin"), deleteProduct);

export default router;
