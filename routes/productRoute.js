const express = require('express');
const router = express.Router();
const { createProduct, getOneProduct, getAllProducts, updateProduct, deleteProduct } = require('../controller/productCtrl');


router.post('/create-product',createProduct);
router.get('/get-a-product/:id',getOneProduct);
router.get('/get-all-product',getAllProducts);
router.put('/update-product/:id',updateProduct);
router.delete('/delete-product/:id',deleteProduct);

module.exports = router;