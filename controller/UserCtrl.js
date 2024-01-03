const { getSignedJwtToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require('express-async-handler');

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
    // console.log(email,password);
});

module.exports = {createUser, loginUser};