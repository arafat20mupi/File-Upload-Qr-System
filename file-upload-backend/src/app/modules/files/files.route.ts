import express from "express";
import { upload } from "../../../middleware/multerConfig";
import { getAllFilesController, getSingleFiles, getUserFilesController, updateFileController, uploadFileController } from "./files.controller";
import { uploadToCloudinary } from "../../../middleware/uploadToCloudianary";

const router = express.Router();

router.post("/upload",
    upload.single("file"),
    uploadFileController
);

router.get("/", getAllFilesController);
router.post("/user", getUserFilesController);
router.get("/:id", getSingleFiles);

router.put("/:id",
    upload.single("file"),
    updateFileController
)

export default router;
