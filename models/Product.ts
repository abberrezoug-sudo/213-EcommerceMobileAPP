import { Schema, model } from "mongoose";

export interface IProductImage {
  public_id: string;
  secure_url: string;
}

export interface IProduct {
  name: string;
  description: string;
  price: number;
  discount: number;
  priceAfterDiscount: number;
  images: IProductImage[];
  category: string;
  stock: number;
  rating: number;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    priceAfterDiscount: {
      type: Number,
      required: true,
      min: 0,
    },

    images: {
      type: [
        {
          public_id: {
            type: String,
            required: true,
          },
          secure_url: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.pre("validate", function () {
  const discount = this.discount || 0;
  const discountedPrice = this.price - (this.price * discount) / 100;
  this.priceAfterDiscount = Math.round(discountedPrice * 100) / 100;
});

export default model<IProduct>("Product", productSchema);
