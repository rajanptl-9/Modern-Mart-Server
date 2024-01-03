const express = require('express');
const {createUser, loginUser, getAllUsers, getOneUser, deleteUser, updateUser} = require('../controller/UserCtrl');
const router = express.Router();

router.post('/register',createUser);
router.post('/login',loginUser);
router.get('/all-users',getAllUsers);
router.get('/:id',getOneUser);
router.put('/:id',updateUser);
router.delete('/:id',deleteUser);

module.exports = router;