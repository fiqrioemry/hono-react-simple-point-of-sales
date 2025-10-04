import cloudinary from "@/config/cloudinary";
import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";

// --- internal helper ---
async function uploadBuffer(buffer: Buffer): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "auto",
          folder: process.env.CLOUDINARY_FOLDER_NAME,
          transformation: [
            {
              width: 500,
              height: 500,
              crop: "limit",
              format: "webp",
            },
          ],
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined
        ) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("No result from Cloudinary"));
          resolve(result);
        }
      )
      .end(buffer);
  });
}

// --- public API ---

export async function uploadImage(
  input?: string | File | null
): Promise<string | null> {
  if (!input) return null;

  if (input instanceof File) {
    const buffer = Buffer.from(await input.arrayBuffer());
    const result = await uploadBuffer(buffer);
    return result.secure_url;
  }

  if (typeof input === "string") {
    return input; // keep existing URL
  }

  return null;
}

export async function uploadImages(
  input?: string | File | (string | File)[] | null
): Promise<string[] | null> {
  if (!input) return null;

  const images = Array.isArray(input) ? input : [input];
  const urls: string[] = [];

  for (const img of images) {
    if (img instanceof File) {
      const buffer = Buffer.from(await img.arrayBuffer());
      const result = await uploadBuffer(buffer);
      urls.push(result.secure_url);
    } else if (typeof img === "string") {
      urls.push(img);
    }
  }

  return urls;
}
export function deleteImage(url?: string | null): void {
  if (!url) return;

  (async () => {
    try {
      const fileName = url.split("/").pop();
      if (!fileName) return;

      const publicId = `${process.env.CLOUDINARY_FOLDER_NAME}/${
        fileName.split(".")[0]
      }`;
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });

      console.log(`Deleted: ${publicId}`);
    } catch (err) {
      console.error(`Failed to delete ${url}`, err);
    }
  })(); // fire-and-forget
}

export function deleteImages(urls?: string[] | null): void {
  if (!urls || urls.length === 0) return;

  (async () => {
    for (const url of urls) {
      try {
        const fileName = url.split("/").pop();
        if (!fileName) continue;

        const publicId = `${process.env.CLOUDINARY_FOLDER_NAME}/${
          fileName.split(".")[0]
        }`;
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });

        console.log(`Deleted: ${publicId}`);
      } catch (err) {
        console.error(`Failed to delete ${url}`, err);
      }
    }
  })(); // fire-and-forget
}
