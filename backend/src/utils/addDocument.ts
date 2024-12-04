const { Document } = require("../models/uploadModel");
const addDoc = (file, user) => {
  return new Promise(async (resolve, reject) => {
    // Check if file is present
    if (!file) {
      reject("File is missing!");
    }
    if (!user) {
      reject("User not found");
    }

    const document = await Document.create({
      doc: { data: file.buffer, contentType: file.mimetype },
      user,
    });

    if (!document) {
      reject("Failed to add Document");
    }
    resolve(document._id);
  });
};
module.exports = addDoc;
