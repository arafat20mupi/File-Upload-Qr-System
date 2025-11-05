import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import QRCode from "qrcode";
import dotenv from "dotenv";
import { FileModel } from "./files.schema";
import { User } from "../user/user.schema";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const uploadToCloudinary = (file: Express.Multer.File) => {
  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "uploads" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result!.secure_url);
      }
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

export const uploadFileController = async (req: Request, res: Response) => {
  try {
    const email = req.body.email as string;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = await uploadToCloudinary(file);

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Save file info to MongoDB first (without QR code)
    const savedFile = await FileModel.create({
      name: file.originalname,
      size: file.size,
      url: fileUrl,
      userID: user._id,
    });

    // Generate QR code pointing to route, NOT direct Cloudinary URL
    const routeLink = `${process.env.CLIENT_URL}/files/TRADELICENCE/${savedFile._id}`;
    const qrCodeData = await QRCode.toDataURL(routeLink);

    // Save QR code to DB
    savedFile.qrCode = qrCodeData;
    await savedFile.save();

    res.status(200).json({
      message: "File uploaded successfully",
      data: savedFile,
      qrCode: qrCodeData,
    });
  } catch (error: any) {
    console.error("Upload failed:", error);
    res.status(500).json({ message: error.message || "Upload failed" });
  }
};

export const updateFileController = async (req: Request, res: Response) => {
  try {
    // Update pdf only 
    const fileId = req.params.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }



    const fileUrl = await uploadToCloudinary(file);
    const updatedFile = await FileModel.findByIdAndUpdate(
      fileId,
      { url: fileUrl, name: file.originalname, size: file.size },
      { new: true }
    );
    if (!updatedFile) {
      return res.status(404).json({ message: "File not found" });
    }
    res.status(200).json({
      message: "File updated successfully",
      data: updatedFile,
    });
  } catch (error: any) {
    console.error("Update failed:", error);
    res.status(500).json({ message: error.message || "Update failed" });
  }
}

export const getAllFilesController = async (req: Request, res: Response) => {
  try {
    const files = await FileModel.find().sort({ createdAt: -1 });
    res.status(200).json(files);
  } catch (error: any) {
    console.error("Failed to fetch files:", error);
    res.status(500).json({ message: error.message || "Failed to fetch files" });
  }
};

export const getUserFilesController = async (req: Request, res: Response) => {
  try {
    const email = req.body.email as string;

    // fast find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const files = await FileModel.find({ userID: user._id }).sort({ createdAt: -1 });
    res.status(200).json(files);
  } catch (error: any) {
    console.error("Failed to fetch files:", error);
    res.status(500).json({ message: error.message || "Failed to fetch files" });
  }
};

export const getSingleFiles = async (req: Request, res: Response) => {
  try {
    const fileId = req.params.id;
    const file = await FileModel.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }
    res.status(200).json(file);
  } catch (error: any) {
    console.error("Failed to fetch file:", error);
    res.status(500).json({ message: error.message || "Failed to fetch file" });
  }
}