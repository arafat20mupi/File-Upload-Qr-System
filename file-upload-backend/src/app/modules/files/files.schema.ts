import { Schema, model } from "mongoose";

const fileSchema = new Schema(
  {
    name: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    qrCode: { type: String}, 
    userID: {
      type: String,
    }
  },
  { timestamps: true }
);

export const FileModel = model("File", fileSchema);
