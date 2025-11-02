import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
const storage = multer.memoryStorage();
export const upload = multer({ storage });
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



// ---------------------
// Single File Upload
// ---------------------
export const uploadSingleImage = (fieldName: string) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = (req as any).file || (req.files && (req.files as any)[fieldName]?.[0]);
    if (!file) return next();

    const stream = cloudinary.uploader.upload_stream((err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      // প্রতিটি ফিল্ডের জন্য আলাদা property
      (req as any)[`${fieldName}Url`] = result!.secure_url;

      console.log(`${fieldName} uploaded:`, result!.secure_url);
      next();
    });

    streamifier.createReadStream(file.buffer).pipe(stream);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Single image upload failed" });
  }
};

// ---------------------
// Multiple Files Upload
// ---------------------
export const uploadMultipleImages = (fieldName: string) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = (req.files as any)?.[fieldName];
    if (!files || files.length === 0) return next();

    const uploadedUrls: string[] = [];

    await Promise.all(
      files.map(
        (file: Express.Multer.File) =>
          new Promise<void>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream((err, result) => {
              if (err) reject(err);
              else {
                uploadedUrls.push(result!.secure_url);
                resolve();
              }
            });
            streamifier.createReadStream(file.buffer).pipe(stream);
          })
      )
    );

    // এখানে ফিল্ড অনুযায়ী dynamic key
    (req as any)[`${fieldName}Urls`] = uploadedUrls;

    console.log(`${fieldName} uploaded:`, uploadedUrls);
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Multiple images upload failed" });
  }
};