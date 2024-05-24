const express = require('express');
const {createUser, loginUser, getAllUsers, getOneUser, deleteUser, updateUser, blockUser, unblockUser, handleRefreshToken, logoutUser, updatePassword, forgotPasswordToken, resetPassword, getWishlist, loginAdmin, saveAddress, userCart, getCart, clearCart, applyCoupon, makeOrder, getOrder, getAllOrder, updateOrderStatus, getUnblockedCustomers, getBlockedCustomers, removeProductFromCart, updateCartProduct, getMyOrders, getMonthWiseOrderIncome, getYearlyOrder, updateProfile,} = require('../controller/UserCtrl');
const { authHandler, isAdmin } = require('../middlewares/authHandler');
const { checkout, paymentVerification } = require('../controller/paymentCtrl');

const router = express.Router();

router.post('/register',createUser);
router.post('/login',loginUser);
router.post('/login-admin',loginAdmin);
router.post('/cart',authHandler,userCart);
router.post('/cart/apply-coupon',authHandler,applyCoupon);  
router.post('/cart/make-order',authHandler,makeOrder);
router.post('/forgot-password-token',forgotPasswordToken);
router.post('/order/checkout',authHandler,checkout);
router.post('/order/payment-verification',authHandler,paymentVerification);
router.put('/update-profile',authHandler,updateProfile);
router.put('/password',authHandler,updatePassword);
router.put('/save-address',authHandler, saveAddress);
router.put('/order/update-order/:id',authHandler,isAdmin,updateOrderStatus);
router.put('/reset-password/:token',resetPassword);
router.put('/cart',authHandler,updateCartProduct);
router.get('/all-users',getAllUsers);
router.get('/get-orders',authHandler,getOrder);
router.get('/get-my-orders',authHandler,getMyOrders);
router.get('/get-all-orders',authHandler,isAdmin,getAllOrder);
router.get("/get-unblocked-customers",authHandler,isAdmin,getUnblockedCustomers);
router.get("/get-blocked-customers",authHandler,isAdmin,getBlockedCustomers);
router.get('/wishlist',authHandler, getWishlist);
router.get('/get-cart',authHandler,getCart);
router.get('/refresh',handleRefreshToken);
router.get('/logout',logoutUser);
router.get('/get-monthly-order-income',authHandler,isAdmin,getMonthWiseOrderIncome);
router.get('/get-yearly-order',authHandler,isAdmin,getYearlyOrder);
router.put('/:id',authHandler, updateUser);
router.put('/block-user/:id',authHandler, isAdmin, blockUser);
router.put('/unblock-user/:id',authHandler, isAdmin, unblockUser);
router.get('/:id',authHandler,isAdmin, getOneUser);
router.delete('/clear-cart',authHandler,clearCart);
router.delete('/:id',authHandler, deleteUser);
router.delete('/cart/:id',authHandler,removeProductFromCart);


module.exports = router;