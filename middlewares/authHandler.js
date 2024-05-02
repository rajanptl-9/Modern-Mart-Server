const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const asyncHandler = require("express-async-handler");

const authHandler = asyncHandler(async(req,res,next) => {
    let token;    
    if (req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(" ")[1];
        try {
            if(token){                
                const verifiedToken = jwt.verify(token,process.env.JWT_SECRET_KEY);
                const user = await User.findById(verifiedToken?.id);
                req.user = user;
                next();
            }   
        } catch (error) {
            throw new Error ("Authorized token expired! Please log in again.");
        }
    }else{
        throw new Error( "There is no signed token attached to header!");
    }
});

const isAdmin = asyncHandler( async (req,res,next) => {
    let user = req.user;
    if(user.role !== "admin"){
        throw new Error("You are not an admin!");
    }else{
        next();
    }
});

module.exports = { 
    authHandler, 
    isAdmin
};