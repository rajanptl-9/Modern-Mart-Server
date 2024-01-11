const express = require('express');
const { createCategory, updateCategory, deleteCategory, getOneCategory, getAllCategory } = require('../controller/prodCategoryCtrl');
const { authHandler, isAdmin } = require('../middlewares/authHandler');
const router = express.Router();

router.post('/',authHandler,isAdmin,createCategory);
router.put('/:id',authHandler,isAdmin,updateCategory);
router.delete('/:id',authHandler,isAdmin,deleteCategory);
router.get('/:id',getOneCategory);
router.get('/',getAllCategory);

module.exports= router;