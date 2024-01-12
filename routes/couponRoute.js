const express = require('express');
const router = express.Router();
const { createCoupon, updateCoupon, deleteCoupon, getOneCoupon, getAllCoupon } = require('../controller/couponCtrl');
const { authHandler, isAdmin } = require('../middlewares/authHandler');

router.post('/',authHandler,isAdmin,createCoupon);
router.get('/:id',getOneCoupon);
router.get('/',getAllCoupon);
router.put('/:id',authHandler,isAdmin,updateCoupon);
router.delete('/:id',authHandler,isAdmin,deleteCoupon);

module.exports= router;