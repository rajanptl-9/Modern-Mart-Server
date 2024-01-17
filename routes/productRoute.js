const express = require('express');
const router = express.Router();
const { createProduct, getOneProduct, getAllProducts, updateProduct, deleteProduct, addToWishlist, userRating, uploadImages, unlinkFileswithPaths } = require('../controller/productCtrl');
const { authHandler, isAdmin } = require('../middlewares/authHandler');
const { uploadPhoto, productImageResize } = require('../middlewares/uploadImages');

router.post('/',authHandler,isAdmin,createProduct);
router.put('/wishlist',authHandler,addToWishlist);
router.put('/rating',authHandler,userRating);
router.put('/:id',authHandler,isAdmin,updateProduct);
router.put('/upload/:id',authHandler,isAdmin,uploadPhoto.array("images",10),productImageResize,uploadImages,unlinkFileswithPaths);
router.get('/:id',getOneProduct);
router.get('',getAllProducts);
router.delete('/:id',authHandler,isAdmin,deleteProduct);

module.exports = router;