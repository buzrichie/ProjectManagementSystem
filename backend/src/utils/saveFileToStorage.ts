import fs from "fs";
import path from "path";

export const saveFileToStorage = async (
  file: Express.Multer.File,
  destinationPath: string
): Promise<void> => {
  try {
    // Construct the absolute path for storage
    const storagePath = path.resolve(__dirname, "../public", destinationPath);

    // Ensure the directory exists
    const dir = path.dirname(storagePath);
    await fs.promises.mkdir(dir, { recursive: true });

    // Check if the file already exists
    if (fs.existsSync(storagePath)) {
      console.error("File already exists:", storagePath);
      throw new Error("File already exists");
    }

    // Create a writable stream
    const writableStream = fs.createWriteStream(storagePath);

    // Write the buffer data in chunks
    const chunkSize = 1024 * 1024; // 1MB per chunk
    let offset = 0;

    while (offset < file.buffer.length) {
      const chunk = file.buffer.subarray(offset, offset + chunkSize);
      writableStream.write(chunk);
      offset += chunkSize;
    }

    // Close the writable stream
    writableStream.end();
    // console.log(`File saved to: ${storagePath}`);
  } catch (error) {
    throw new Error(`File saving failed, ${error}`);
  }
};
