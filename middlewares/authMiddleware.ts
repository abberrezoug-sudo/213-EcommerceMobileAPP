import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

type UserRole = "admin" | "client";

type TokenPayload = {
  id: string;
  role: UserRole;
};

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

const isTokenPayload = (payload: string | jwt.JwtPayload): payload is TokenPayload => {
  return (
    typeof payload !== "string" &&
    typeof payload.id === "string" &&
    (payload.role === "admin" || payload.role === "client")
  );
};

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({ msg: "JWT_SECRET is missing in .env" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, jwtSecret);

    if (!isTokenPayload(decoded)) {
      return res.status(401).json({ msg: "Invalid token" });
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }

    req.user = {
      id: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ msg: "Token is not valid" });
  }
};

export const checkRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    next();
  };
};

export const cheakRoles = checkRoles;
