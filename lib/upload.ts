import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

const UPLOAD_STORAGE = process.env.UPLOAD_STORAGE || "local";

// Initialize S3 Client only if needed
const s3Client = UPLOAD_STORAGE === "s3" 
  ? new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    })
  : null;

/**
 * Uploads a file to the configured storage (Local or S3).
 * @param file The File object (from FormData).
 * @returns The public URL of the uploaded file.
 */
export async function uploadFile(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

  if (UPLOAD_STORAGE === "s3" && s3Client) {
    // S3 Upload
    const bucket = process.env.AWS_S3_BUCKET;
    if (!bucket) throw new Error("AWS_S3_BUCKET is not defined in environment variables.");

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: `uploads/${fileName}`,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",
      // ACL: "public-read" // Optional depending on bucket policy
    });

    await s3Client.send(command);
    
    // Return the S3 URL
    return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/${fileName}`;
  } else {
    // Local Upload
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(uploadDir, fileName), buffer);
    return `/uploads/${fileName}`;
  }
}
