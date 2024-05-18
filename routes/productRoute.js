const express = require('express');
const router = express.Router();
const { createProduct, getOneProduct, getAllProducts, updateProduct, deleteProduct, addToWishlist, userRating, specificProducts } = require('../controller/productCtrl');
const { authHandler, isAdmin } = require('../middlewares/authHandler');

router.post('/',authHandler,isAdmin,createProduct);
router.put('/wishlist',authHandler,addToWishlist);
router.put('/rating',userRating);
router.put('/:id',authHandler,isAdmin,updateProduct);
router.get('',getAllProducts);
router.get('/specific-products',specificProducts);
router.get('/:id',getOneProduct);
router.delete('/:id',authHandler,isAdmin,deleteProduct);

module.exports = router;