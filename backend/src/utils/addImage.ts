import { Image } from "../models/UploadModel";
import { IUser } from "../models/UserModel";
const addImage = (file: any, user: IUser) => {
  return new Promise(async (resolve, reject) => {
    // Check if file is present
    if (!file || !file.buffer) {
      return reject("File is missing!");
    }
    if (!user) {
      return reject("User not found");
    }

    const image = await Image.create({
      image: { data: file.buffer, contentType: file.mimetype },
      user,
    });

    if (!image) {
      return reject("Failed to add image");
    }

    return resolve(image._id);
  });
};
module.exports = addImage;
