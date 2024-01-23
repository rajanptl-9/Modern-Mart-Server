const express = require('express');
const { createEnquiry, updateEnquiry, deleteEnquiry, getOneEnquiry, getAllEnquiry } = require('../controller/enquiryCtrl');
const { authHandler, isAdmin } = require('../middlewares/authHandler');
const router = express.Router();

router.post('/',authHandler,isAdmin,createEnquiry);
router.put('/:id',authHandler,isAdmin,updateEnquiry);
router.delete('/:id',authHandler,isAdmin,deleteEnquiry);
router.get('/:id',getOneEnquiry);
router.get('/',getAllEnquiry);

module.exports= router;