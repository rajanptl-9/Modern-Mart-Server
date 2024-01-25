const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../public/images/original"));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + ".jpeg");
    },
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb({ message: "Unsupported File Format!" }, false);
    }
}

const uploadPhotos = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fieldSize: 2000000 },
});

const productImageResize = async (req, res, next) => {
    if (!req.files) return next();
    let newFiles = [];    
    await Promise.all(
        req.files.map(async file => {
            const imageData = await fs.promises.readFile(file.path);
            await sharp(imageData).resize(300, 300).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`public/images/products/${file.filename}`);
            newFiles.push(path.join(__dirname, `../public/images/products/${file.filename}`));
        })
    );    
    for (const file of req.files) {        
        fs.unlinkSync(file.path, (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log('Original File deleted successfully');
            }
        });
    }
    req.newFiles = newFiles;
    next();
}

module.exports = { uploadPhotos, productImageResize, };