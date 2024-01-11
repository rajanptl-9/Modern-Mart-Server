const express = require('express');
const router = express.Router();
const { createProduct, getOneProduct, getAllProducts, updateProduct, deleteProduct, addToWishlist } = require('../controller/productCtrl');
const { authHandler, isAdmin } = require('../middlewares/authHandler');

router.post('/',authHandler,isAdmin,createProduct);
router.get('/:id',getOneProduct);
router.get('',getAllProducts);
router.put('/:id',authHandler,isAdmin,updateProduct);
router.delete('/:id',authHandler,isAdmin,deleteProduct);
router.put('/wishlist',authHandler,addToWishlist);

module.exports = router;