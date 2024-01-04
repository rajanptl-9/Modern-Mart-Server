const express = require('express');
const router = express.Router();
const { createProduct, getOneProduct, getAllProducts } = require('../controller/productCtrl');


router.post('/create-product',createProduct);
router.get('/get-a-product/:id',getOneProduct);
router.get('/get-all-product',getAllProducts);

module.exports = router;