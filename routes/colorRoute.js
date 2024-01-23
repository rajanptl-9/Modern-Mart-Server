const express = require('express');
const { createColor, updateColor, deleteColor, getOneColor, getAllColor } = require('../controller/colorCtrl');
const { authHandler, isAdmin } = require('../middlewares/authHandler');
const router = express.Router();

router.post('/',authHandler,isAdmin,createColor);
router.put('/:id',authHandler,isAdmin,updateColor);
router.delete('/:id',authHandler,isAdmin,deleteColor);
router.get('/:id',getOneColor);
router.get('/',getAllColor);

module.exports= router;