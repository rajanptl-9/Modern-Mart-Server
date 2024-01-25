const express = require('express');
const router = express.Router();
const { createProduct, getOneProduct, getAllProducts, updateProduct, deleteProduct, addToWishlist, userRating, uploadImages, deleteImages } = require('../controller/productCtrl');
const { authHandler, isAdmin } = require('../middlewares/authHandler');
const { uploadPhotos, productImageResize } = require('../middlewares/uploadImages');

router.post('/',authHandler,isAdmin,createProduct);
router.put('/wishlist',authHandler,addToWishlist);
router.put('/rating',authHandler,userRating);
router.put('/upload-product-image',authHandler,isAdmin,uploadPhotos.array("images",10),productImageResize,uploadImages);
router.put('/:id',authHandler,isAdmin,updateProduct);
router.get('',getAllProducts);
router.get('/:id',getOneProduct);
router.delete('/delete-product-image/:id',authHandler,isAdmin,deleteImages);
router.delete('/:id',authHandler,isAdmin,deleteProduct);

module.exports = router;