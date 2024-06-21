const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    secure: true, // Add this line
});


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'wanderlust_dev',
      allowedFormats: ["png", "jpg", "jpeg"], // supports promises as well
      resource_type: 'image', // Add this line
      
    },
  });

  module.exports = {
    cloudinary,
    storage,
  };