const { getSignedJwtToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require("../utils/validateMongodbID");
const { getRefreshSignedToken } = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
const { sendMail } = require("./emailCtrl");
const crypto = require('crypto');

const createUser = asyncHandler(async (req,res) => {
    const email = req.body.email;
    const findUser = await User.findOne({email : email}).maxTimeMS(20000);    
    if(!findUser){            
        const newUser = await User.create(req.body);
        res.json(newUser);
    }else{
        throw new Error("User Already Exist! Try to login.")
    }
});

const loginUser = asyncHandler(async(req,res) => {
    const {email, password} = req.body;
    const findUser = await User.findOne({email:email}).maxTimeMS(20000);
    if(findUser && await findUser.isPasswordCorrect(password)){
        const refreshToken = await getRefreshSignedToken(findUser?._id);
        const updateUser = await User.findByIdAndUpdate(findUser?._id,{
            refreshToken: refreshToken,
        },{ new:true });
        res.cookie('refreshToken',refreshToken,{
            httpOnly: true,
            maxAge: 72*3600*1000,
        });
        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: getSignedJwtToken(findUser?._id),
        });
    }else{
        throw new Error ("Invalid Email or Password!");
    }
});

const loginAdmin = asyncHandler(async(req,res) => {
    const {email, password} = req.body;
    const findAdmin = await User.findOne({email:email}).maxTimeMS(20000);
    if(findAdmin.role !== "admin") throw new Error("Not Authorized!");
    if(findAdmin && await findAdmin.isPasswordCorrect(password)){
        const refreshToken = await getRefreshSignedToken(findAdmin?._id);
        const updateAdmin = await User.findByIdAndUpdate(findAdmin?._id,{
            refreshToken: refreshToken,
        },{ new:true });
        res.cookie('refreshToken',refreshToken,{
            httpOnly: true,
            maxAge: 72*3600*1000,
        });
        res.json({
            _id: findAdmin?._id,
            firstname: findAdmin?.firstname,
            lastname: findAdmin?.lastname,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            token: getSignedJwtToken(findAdmin?._id),
        });
    }else{
        throw new Error ("Invalid Email or Password!");
    }
});

const logoutUser = asyncHandler(async(req,res) => {
    const cookie = req.cookies;
    console.log(cookie);   
    if(!cookie?.refreshToken) throw new Error("No Refresh Token in cookie!");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken});
    if(!user){
        res.clearCookie('refreshToken',{
            httpOnly: true,
            secure:true,
        });
        return res.sendStatus(204);
    }
    await User.findByIdAndUpdate(user.id,{
        refreshToken: "",
    },{ new:true });
    res.clearCookie('refreshToken',{
        httpOnly: true,
        secure:true,
    });
    return res.sendStatus(204);
});

const handleRefreshToken = asyncHandler(async(req,res) => {
    const cookie = req.cookies;
    if(!cookie?.refreshToken) throw new Error("No Refresh Token in cookie!");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken});
    if(!user) throw new Error("No refresh Token in db or expires!");
    jwt.verify(refreshToken, process.env.JWT_SECRET_KEY, (error,decoded) => {
        if(error || user.id != decoded.id){
            throw new Error("There is somthing wrong with refreshToken");
        }
        const accessToken = getSignedJwtToken(user.id);
        res.json({accessToken});
    });
});

const getAllUsers = asyncHandler(async (req,res) => {
    try {
        const getUsers = await User.find();
        res.json(getUsers);
    } catch (error) {
        throw new Error (error);
    }
});

const getOneUser = asyncHandler(async (req,res) => {
    const {id} = req.user;
    validateMongoDbId(id);
    try{
        const user = await User.findById(id);
        res.json(user);
    }catch(error){
        throw new Error(error);
    }
});

const updateUser = asyncHandler(async (req,res) => {
    const {id} = req.user;
    validateMongoDbId(id);
    try{
        const user = await User.findByIdAndUpdate(id, {
            firstname : req?.body?.firstname,
            lastname  : req?.body?.lastname
        },{
            new: true,
        });
        res.json(user);
    }catch(error){
        throw new Error(error);
    }
});

const deleteUser = asyncHandler(async (req,res) => {
    const {id} = req.user;
    validateMongoDbId(id);
    try{
        const user = await User.findByIdAndDelete(id);
        res.json(user);
    }catch(error){
        throw new Error(error);
    }
});

const blockUser = asyncHandler( async (req,res) => {
    let {id} = req.params;    
    validateMongoDbId(id);
    try {
        const blockedUser = await User.findByIdAndUpdate(id, {
                isBlocked : "true",
            },{
                new: true,
            });
        res.json({
            message : "User blocked!",
            success : true,
        })
    } catch (error) {
        throw new Error(error);
    }
});
const unblockUser = asyncHandler( async (req,res) => {
    let {id} = req.params;
    validateMongoDbId(id);
    try {
        const blockedUser = await User.findByIdAndUpdate(id, {
                isBlocked: "false",
            },{
                new: true,
            })
        res.json({
            message : "User unblocked!",
            success : true,
        })
    } catch (error) {
        throw new Error(error);
    }
});

const updatePassword = asyncHandler(async(req,res) =>{
    const {_id} = req.user;
    const {password} = req.body;
    
    validateMongoDbId(_id);
    const user = await User.findById(_id);
    if(password){
        user.password = password;
        const updatedUserPassword = await user.save();
        res.json(updatedUserPassword);
    }else{
        res.json(user);
    }
});

const forgotPasswordToken = asyncHandler(async(req,res) => {
    const { email } = req.body;    
    const user = await User.findOne({email});
    
    if(!user) throw new Error ("User not found!");
    try {
        const token = await user.createResetPasswordToken();
        await user.save();
        const resetURL = `Hi, Please follow this link to reset your password. link is valid till 10 min.<a href='https://localhost:5000/api/user/reset-password/${token}'>Click here</a>`;
        const data = {
            to: email,
            subject: "Change password",
            text: "Hi, forgot password? No worry, here is the link.",
            htm: resetURL,
        }
        sendMail(data);
        res.json(token);
    } catch (error) {
        throw new Error(error);
    }
});

const resetPassword = asyncHandler(async(req,res) =>{
    const {password} = req.body;
    const {token} = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpire: {$gt: Date.now()},
    });
    if(!user) throw new Error("Token expired, Please try again later.");
    user.password = password;
    user.passwordResetToken = user.passwordResetExpire = undefined;
    await user.save();
    res.send(user);
});

const getWishlist = asyncHandler(async(req,res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        const findUser = await User.findById(_id).populate("wishlist");
        res.json(findUser);
    } catch (error) {
        throw new Error(error);
    }
});

const saveAddress = asyncHandler(async(req,res)=>{
    const { _id } = req.user; 
    validateMongoDbId(_id);
    const { address } = req.body;
    try {
        const updatedAddressUser = await User.findByIdAndUpdate(_id,{
            address:address
        },{ new:true });
        res.json(updatedAddressUser);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    createUser, 
    loginUser, 
    loginAdmin,
    getAllUsers, 
    getOneUser, 
    updateUser, 
    deleteUser,
    blockUser, 
    unblockUser,
    handleRefreshToken,
    logoutUser,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
    getWishlist,
    saveAddress, 
};