import { Schema, model} from "mongoose"
export interface Iproduct {
    name: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    stock: number;
    rating: number;
}
const productSchema = new Schema<Iproduct>({
    name:{ type: String, required: true },
    description:{ type: String, required: true },
    price:{ type: Number, required: true },
images: {
    type: [String],
    required: true
},
    category:{ type: String, required: true },
    stock:{ type: Number, required: true },
    rating:{ type: Number, default: 0 }
},{
    timestamps: true,
}
)
export default model<Iproduct>("Product", productSchema)