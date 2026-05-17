import { memoryStorage } from "multer";

export const TEAM_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

export const teamImageMulterOptions = {
  storage: memoryStorage(),
  limits: { fileSize: TEAM_UPLOAD_MAX_BYTES },
};
