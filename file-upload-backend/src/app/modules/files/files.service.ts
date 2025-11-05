import { FileModel } from "./files.schema";
import { generateQrCode } from "../../../middleware/generateQrCode";
import { User } from "../user/user.schema";

export const uploadFileService = async (file: Express.Multer.File, email: string) => {
  try {



    const user = await User.findOne({ email });
    const userId = user ? user._id : null;

    // ✅ Generate QR code for the uploaded file URL
    const qrCode = await generateQrCode();

    // ✅ Save file info to DB
    const savedFile = await FileModel.create({
      name: file.originalname,
      size: file.size,
      url: file.path,
      qrCode,
      uploadedBy: userId,
    });

    return savedFile;
  } catch (error) {
    throw new Error("File upload service failed: " + error);
  }
};
