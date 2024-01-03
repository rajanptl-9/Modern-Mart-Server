const express = require('express');
const {createUser, loginUser, getAllUsers, getOneUser, deleteUser, updateUser} = require('../controller/UserCtrl');
const { authHandler, isAdmin } = require('../middlewares/authHandler');

const router = express.Router();

router.post('/register',createUser);
router.post('/login',loginUser);
router.get('/all-users',getAllUsers);
router.get('/:id',authHandler, getOneUser);
router.put('/:id',authHandler, isAdmin, updateUser);
router.delete('/:id',authHandler, isAdmin, deleteUser);

module.exports = router;