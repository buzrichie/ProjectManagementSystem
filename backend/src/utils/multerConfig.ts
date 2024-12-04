import multer from "multer";
const storage = multer.memoryStorage(); // Use memory storage for small files

const upload = multer({ storage });

export default upload;
