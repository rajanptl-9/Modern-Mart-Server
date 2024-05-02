const express = require('express');
const router = express.Router();

const { authHandler, isAdmin } = require('../middlewares/authHandler');
const { uploadImages, deleteImages } = require('../controller/uploadCtrl');
const { uploadPhotos, productImageResize } = require('../middlewares/uploadImages');


router.put('/',authHandler,isAdmin,uploadPhotos.array("images",10),productImageResize,uploadImages);
router.delete('/:id',authHandler,isAdmin,deleteImages);

module.exports = router;