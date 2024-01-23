const express = require('express');
const {createUser, loginUser, getAllUsers, getOneUser, deleteUser, updateUser, blockUser, unblockUser, handleRefreshToken, logoutUser, updatePassword, forgotPasswordToken, resetPassword, getWishlist, loginAdmin, saveAddress, userCart, getCart, clearCart, applyCoupon, makeOrder, getOrder, updateOrderStatus,} = require('../controller/UserCtrl');
const { authHandler, isAdmin } = require('../middlewares/authHandler');

const router = express.Router();

router.post('/register',createUser);
router.post('/login',loginUser);
router.post('/login-admin',loginAdmin);
router.post('/cart',authHandler,userCart);
router.post('/cart/apply-coupon',authHandler,applyCoupon);  
router.post('/cart/make-order',authHandler,makeOrder);
router.post('/forgot-password-token',forgotPasswordToken);
router.put('/password',authHandler,updatePassword);
router.put('/save-address',authHandler, saveAddress);
router.put('/order/update-order/:id',authHandler,isAdmin,updateOrderStatus);
router.put('/reset-password/:token',resetPassword);
router.get('/all-users',getAllUsers);
router.get('/get-orders',authHandler,getOrder);
router.get('/wishlist',authHandler, getWishlist);
router.get('/get-cart',authHandler,getCart);
router.get('/refresh',handleRefreshToken);
router.get('/logout',logoutUser);
router.put('/:id',authHandler, updateUser);
router.put('/block-user/:id',authHandler, isAdmin, blockUser);
router.put('/unblock-user/:id',authHandler, isAdmin, unblockUser);
router.get('/:id',authHandler,isAdmin, getOneUser);
router.delete('/clear-cart',authHandler,clearCart);
router.delete('/:id',authHandler, deleteUser);

module.exports = router;