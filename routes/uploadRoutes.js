import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import fs from "fs";
import { uploadFile } from "../controllers/uploadController.js";

dotenv.config();

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer Disk Storage for temporary files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

router.post("/", upload.single("file"), uploadFile);

export default router;
