import fs from "fs";

export const uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    try {
        console.log(`File saved locally: ${req.file.path}`);

        // Construct local URL
        // Example: http://localhost:5000/uploads/123-filename.mp4
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        const type = req.file.mimetype.startsWith("video") ? "video" :
            req.file.mimetype === "application/pdf" ? "pdf" : "image";

        res.json({
            url: fileUrl,
            type: type,
            filename: req.file.filename
        });
    } catch (error) {
        console.error("Local upload processing error:", error);

        // Cleanup file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ message: "Upload failed", error: error.message });
    }
};
