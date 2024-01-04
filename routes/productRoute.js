const express = require('express');
const router = express.Router();
const { createProduct, getOneProduct, getAllProducts, updateProduct, deleteProduct } = require('../controller/productCtrl');
const { authHandler, isAdmin } = require('../middlewares/authHandler');

router.post('/create-product',authHandler,isAdmin,createProduct);
router.get('/get-a-product/:id',getOneProduct);
router.get('/get-all-product',getAllProducts);
router.put('/update-product/:id',authHandler,isAdmin,updateProduct);
router.delete('/delete-product/:id',authHandler,isAdmin,deleteProduct);

module.exports = router;