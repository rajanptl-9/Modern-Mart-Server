const asyncHandler = require("express-async-handler");
const {cloudinaryUploadImage,cloudinaryDeleteImage} = require('../utils/cloudinary');
const fs = require('fs');

const uploadImages = asyncHandler(async (req, res) => {
    try {
        const uploader = (path) => cloudinaryUploadImage(path, "images");
        const urls = [];
        const files = req.newFiles;        
        for (const path of files) {
            const result = await uploader(path);  
            urls.push(result);               
            setTimeout(() => {
                fs.unlinkSync(path, (err) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log('Product File deleted successfully');
                    }
                });
            }, 2000);
        }
        const images = urls.map(path => { return path });
        res.json(images);
    } catch (error) {
        throw new Error(error);
    }
});

const deleteImages = asyncHandler(async (req, res) => {
    const {id} = req.params;
    try {
        const deleted = cloudinaryDeleteImage(id);        
        res.json({message:"Image Deleted Successfully!"});
    } catch (error) {
        throw new Error(error);
    }
});



module.exports = {
    uploadImages,
    deleteImages,
};