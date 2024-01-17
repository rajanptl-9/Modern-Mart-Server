const express = require('express');
const {createUser, loginUser, getAllUsers, getOneUser, deleteUser, updateUser, blockUser, unblockUser, handleRefreshToken, logoutUser, updatePassword, forgotPasswordToken, resetPassword, getWishlist, loginAdmin,} = require('../controller/UserCtrl');
const { authHandler, isAdmin } = require('../middlewares/authHandler');

const router = express.Router();

router.post('/register',createUser);
router.post('/login',loginUser);
router.post('/login-admin',loginAdmin);
router.put('/password',authHandler,updatePassword);
router.post('/forgot-password-token',forgotPasswordToken);
router.put('/reset-password/:token',resetPassword);
router.get('/all-users',getAllUsers);
router.get('/refresh',handleRefreshToken);
router.get('/logout',logoutUser);
router.get('/wishlist',authHandler, getWishlist);
router.get('/:id',authHandler,isAdmin, getOneUser);
router.put('/:id',authHandler, updateUser);
router.delete('/:id',authHandler, deleteUser);
router.put('/block-user/:id',authHandler, isAdmin, blockUser);
router.put('/unblock-user/:id',authHandler, isAdmin, unblockUser);
module.exports = router;