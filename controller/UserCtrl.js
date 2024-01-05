const { getSignedJwtToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require("../utils/validateMongodbID");
const { getRefreshSignedToken } = require('../config/refreshToken');
const jwt = require('jsonwebtoken');

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
    console.log(cookie);   
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

module.exports = {
    createUser, 
    loginUser, 
    getAllUsers, 
    getOneUser, 
    updateUser, 
    deleteUser,
    blockUser, 
    unblockUser,
    handleRefreshToken,
    logoutUser,
};