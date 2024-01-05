const express = require('express');
const {createUser, loginUser, getAllUsers, getOneUser, deleteUser, updateUser, blockUser, unblockUser, handleRefreshToken, logoutUser,} = require('../controller/UserCtrl');
const { authHandler, isAdmin } = require('../middlewares/authHandler');

const router = express.Router();

router.post('/register',createUser);
router.post('/login',loginUser);
router.get('/all-users',getAllUsers);
router.get('/refresh',handleRefreshToken);
router.get('/logout',logoutUser);
router.get('/:id',authHandler,isAdmin, getOneUser);
router.put('/:id',authHandler, updateUser);
router.delete('/:id',authHandler, deleteUser);
router.put('/block-user/:id',authHandler, isAdmin, blockUser);
router.put('/unblock-user/:id',authHandler, isAdmin, unblockUser);
module.exports = router;