import { memoryStorage } from "multer";

export const USER_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

export const userImageMulterOptions = {
  storage: memoryStorage(),
  limits: { fileSize: USER_UPLOAD_MAX_BYTES },
};
