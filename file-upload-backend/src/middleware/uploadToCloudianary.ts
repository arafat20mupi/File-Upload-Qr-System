import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import streamifier from "streamifier";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// augment Express Request to include fileUrl
declare global {
  namespace Express {
    interface Request {
      fileUrl?: string;
    }
  }
}

export const uploadToCloudinary = (fieldName: string) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    if (!file) return next(new Error("No file found"));

    const streamUpload = (file: Express.Multer.File) => {
      return new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream((err, result) => {
          if (err) return reject(err);
          resolve(result!.secure_url);
        });
        streamifier.createReadStream(file.buffer).pipe(stream);
      });
    };

    const url = await streamUpload(file);
    req.fileUrl = url; 
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cloudinary upload failed", error: err });
  }
};


