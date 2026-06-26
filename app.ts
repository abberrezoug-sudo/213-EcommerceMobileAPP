import express from "express";
import cors from "cors";
import authRoutes from "./routes/AuthRouteUser.js";
import productRoutes from "./routes/ProductRoute.js";
const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/product", productRoutes);
app.get("/", (req, res) => {
  res.send("213 API is running...");
});

export default app;