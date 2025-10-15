// import multer from 'multer';
// import { CloudinaryStorage } from 'multer-storage-cloudinary';
// import { v2 as cloudinary } from 'cloudinary';
// import dotenv from 'dotenv';
// import { Request, Response } from 'express';

// dotenv.config()

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_NAME!,
//     api_key: process.env.CLOUDINARY_API_KEY!,
//     api_secret: process.env.CLOUDINARY_API_SECRET!
// })

// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: async (req, file) => {
//         try {
//             if (!file) throw new Error("File is required");

//             const isVideo = file.mimetype.startsWith("video/");
//             return {
//                 folder: isVideo ? "Eventyzze/Videos" : "Eventyzze/Images",
//                 resource_type: isVideo ? "video" : "image",
//             };
//         } catch (error: any) {
//             console.error(`Cloudinary storage error: ${error.message}`);
//             throw error.message;
//         }
//     }
// });

// const cloud = multer({
//     storage: storage,
//     fileFilter: (req: Request, file, cb) => {
//         try {
//             if (
//                 file.mimetype.startsWith("image/") ||
//                 file.mimetype.startsWith("video/")
//             ) {
//                 cb(null, true);
//             } else {
//                 console.error(`Invalid file type: ${file.mimetype}`);
//                 cb(null, false);
//                 return cb(new Error("Only image and video formats are allowed"));
//             }
//         } catch (error: any) {
//             console.error(`File filter error: ${error.message}`);
//             cb(error);
//         }
//     },
//     limits: {
//         fileSize: 50 * 1024 * 1024
//     }
// }).fields([{ name: "image", maxCount: 1 }, { name: "video", maxCount: 1 }]);

// const upload = (req: Request, res: Response, next: Function) => {
    
//     cloud(req, res, (error: any) => {
//         if (error instanceof multer.MulterError) {
//             console.error(`Multer error: ${error.message}`);
//             return res.status(400).json({ status: 'error', message: error.message });
//         } else if (error) {
//             console.error(`Upload error: ${error.message}`);
//             return res.status(500).json({ status: 'error', message: error.message });
//         }
//         next();
//     });
// };

// export default upload;
