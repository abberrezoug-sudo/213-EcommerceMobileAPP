import type { UploadApiResponse } from "cloudinary";
import cloudinary, { hasCloudinaryConfig } from "../config/cloudinary.js";

export type ProductImage = {
  public_id: string;
  secure_url: string;
};

const uploadBuffer = (file: Express.Multer.File) => {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "213-app/products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary upload failed"));
          return;
        }

        resolve(result);
      }
    );

    stream.end(file.buffer);
  });
};

export const uploadProductImages = async (files: Express.Multer.File[] = []) => {
  if (files.length > 0 && !hasCloudinaryConfig()) {
    throw new Error(
      "Cloudinary config missing: add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env"
    );
  }

  const uploadedImages = await Promise.all(files.map(uploadBuffer));

  return uploadedImages.map<ProductImage>((image) => ({
    public_id: image.public_id,
    secure_url: image.secure_url,
  }));
};

export const deleteProductImages = async (images: ProductImage[] = []) => {
  const publicIds = images.map((image) => image.public_id).filter(Boolean);

  if (publicIds.length === 0) {
    return;
  }

  if (!hasCloudinaryConfig()) {
    throw new Error(
      "Cloudinary config missing: add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env"
    );
  }

  await Promise.all(
    publicIds.map((publicId) => cloudinary.uploader.destroy(publicId))
  );
};
