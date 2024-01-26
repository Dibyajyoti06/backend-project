const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadonCloudinary = (localpath) => {
  try {
    if (!localpath) return null;
    const response = cloudinary.uploader.upload(localpath, {
      resource_type: auto,
    });
    console.log(`File is uploaded on Cloudinary`, response.url);
    console.log(response);
    return response;
  } catch (err) {
    fs.unlinkSync(localpath);
    //remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

module.exports = { cloudinary };
