const express = require('express');
const { createBrand, updateBrand, deleteBrand, getOneBrand, getAllBrand } = require('../controller/brandCtrl');
const { authHandler, isAdmin } = require('../middlewares/authHandler');
const router = express.Router();

router.post('/',authHandler,isAdmin,createBrand);
router.put('/:id',authHandler,isAdmin,updateBrand);
router.delete('/:id',authHandler,isAdmin,deleteBrand);
router.get('/:id',getOneBrand);
router.get('/',getAllBrand);

module.exports= router;