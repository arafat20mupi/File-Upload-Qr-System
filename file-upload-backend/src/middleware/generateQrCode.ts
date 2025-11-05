import QRCode from "qrcode";

export const generateQrCode = async (data: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(data);
  } catch (error) {
    throw new Error("QR code generation failed");
  }
};
