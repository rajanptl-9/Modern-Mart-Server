const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Product = require("../models/prodModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const { getSignedJwtToken } = require("../config/jwtToken");
const asyncHandler = require('express-async-handler');
const { getRefreshSignedToken } = require('../config/refreshToken');
const validateMongodbID = require('../utils/validateMongoDBID');
const jwt = require('jsonwebtoken');
const { sendMail } = require("./emailCtrl");
const crypto = require('crypto');
const uniqid = require('uniqid');

const createUser = asyncHandler(async (req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({ email: email }).maxTimeMS(20000);
    if (!findUser) {
        delete req.body.confirmPassword;
        const newUser = await User.create(req.body);
        const refreshToken = await getRefreshSignedToken(newUser?._id);
        const updateUser = await User.findByIdAndUpdate(newUser?._id, {
            refreshToken: refreshToken,
        }, { new: true });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 3600 * 1000,
        });
        res.json({
            _id: newUser?._id,
            firstname: newUser?.firstname,
            lastname: newUser?.lastname,
            email: newUser?.email,
            mobile: newUser?.mobile,
            token: getSignedJwtToken(newUser?._id),
        });
    } else {
        throw new Error("User Already Exist! Try to login.")
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const findUser = await User.findOne({ email: email }).maxTimeMS(20000);
    if (findUser && await findUser.isPasswordCorrect(password)) {
        const refreshToken = await getRefreshSignedToken(findUser?._id);
        const updateUser = await User.findByIdAndUpdate(findUser?._id, {
            refreshToken: refreshToken,
        }, { new: true });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 3600 * 1000,
        });
        const loggedinUser = await User.findById(findUser?._id).populate("wishlist").populate({
            path: "wishlist",
            populate: {
                path: "brand",
                model: "Brand",
            }
        }).exec();
        const wishlist = loggedinUser.wishlist.map(prod => {
            return {
                _id: prod._id,
                title: prod.title,
                price: prod.price,
                brand: prod.brand.title,
                quantity: prod.quantity,
                images: prod.images,
            }
        });
        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            wishlist: wishlist,
            token: getSignedJwtToken(findUser?._id),
        });
    } else {
        throw new Error("Invalid Email or Password!");
    }
});

const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const findAdmin = await User.findOne({ email: email }).maxTimeMS(20000);
    if (findAdmin.role !== "admin") throw new Error("Not Authorized!");
    if (findAdmin && await findAdmin.isPasswordCorrect(password)) {
        const refreshToken = await getRefreshSignedToken(findAdmin?._id);
        const updateAdmin = await User.findByIdAndUpdate(findAdmin?._id, {
            refreshToken: refreshToken,
        }, { new: true });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 3600 * 1000,
        });
        res.json({
            _id: findAdmin?._id,
            firstname: findAdmin?.firstname,
            lastname: findAdmin?.lastname,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            token: getSignedJwtToken(findAdmin?._id),
        });
    } else {
        throw new Error("Invalid Email or Password!");
    }
});

const logoutUser = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    console.log(cookie);
    if (!cookie?.refreshToken) throw new Error("No Refresh Token in cookie!");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
        });
        return res.sendStatus(204);
    }
    await User.findByIdAndUpdate(user.id, {
        refreshToken: "",
    }, { new: true });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
    });
    return res.sendStatus(204);
});

const updateProfile = asyncHandler(async (req, res) => {
    const { _id } = req.user;    
    validateMongodbID(_id);
    const { firstname, lastname } = req.body;
    try {
        const updatedProfile = await User.findByIdAndUpdate(_id, {
            firstname: firstname,
            lastname: lastname,
        }, { new: true });
        
        const loggedinUser = await User.findById(updatedProfile?._id).populate("wishlist").populate({
            path: "wishlist",
            populate: {
                path: "brand",
                model: "Brand",
            }
        }).exec();
        const wishlist = loggedinUser.wishlist.map(prod => {
            return {
                _id: prod._id,
                title: prod.title,
                price: prod.price,
                brand: prod.brand.title,
                quantity: prod.quantity,
                images: prod.images,
            }
        });
        res.json({
            _id: updatedProfile?._id,
            firstname: updatedProfile?.firstname,
            lastname: updatedProfile?.lastname,
            email: updatedProfile?.email,
            mobile: updatedProfile?.mobile,
            wishlist: wishlist || [],
            token: getSignedJwtToken(updatedProfile?._id),
        });
    } catch (error) {
        throw new Error(error);
    }
})

const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No Refresh Token in cookie!");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) throw new Error("No refresh Token in db or expires!");
    jwt.verify(refreshToken, process.env.JWT_SECRET_KEY, (error, decoded) => {
        if (error || user.id != decoded.id) {
            throw new Error("There is somthing wrong with refreshToken");
        }
        const accessToken = getSignedJwtToken(user.id);
        res.json({ accessToken });
    });
});

const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const getUsers = await User.find();
        res.json(getUsers);
    } catch (error) {
        throw new Error(error);
    }
});

const getOneUser = asyncHandler(async (req, res) => {
    const { id } = req.user;
    validateMongodbID(id);
    try {
        const user = await User.findById(id);
        res.json(user);
    } catch (error) {
        throw new Error(error);
    }
});

const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.user;
    validateMongodbID(id);
    try {
        const user = await User.findByIdAndUpdate(id, {
            firstname: req?.body?.firstname,
            lastname: req?.body?.lastname
        }, {
            new: true,
        });
        res.json(user);
    } catch (error) {
        throw new Error(error);
    }
});

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.user;
    validateMongodbID(id);
    try {
        const user = await User.findByIdAndDelete(id);
        res.json(user);
    } catch (error) {
        throw new Error(error);
    }
});

const blockUser = asyncHandler(async (req, res) => {
    let { id } = req.params;
    validateMongodbID(id);
    try {
        const blockedUser = await User.findByIdAndUpdate(id, {
            isBlocked: "true",
        }, {
            new: true,
        });
        const data = {
            message: "User blocked!",
            success: true,
            user: blockedUser,
        };
        res.json(data);
    } catch (error) {
        throw new Error(error);
    }
});

const unblockUser = asyncHandler(async (req, res) => {
    let { id } = req.params;
    validateMongodbID(id);
    try {
        const unblockedUser = await User.findByIdAndUpdate(id, {
            isBlocked: "false",
        }, {
            new: true,
        })
        res.json({
            message: "User unblocked!",
            success: true,
            user: unblockedUser,
        })
    } catch (error) {
        throw new Error(error);
    }
});

const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body;

    validateMongodbID(_id);
    const user = await User.findById(_id);
    if (password) {
        user.password = password;
        const updatedUserPassword = await user.save();
        res.json(updatedUserPassword);
    } else {
        res.json(user);
    }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) throw new Error("User not found!");
    try {
        const token = await user.createResetPasswordToken();
        await user.save();
        console.log(token);

        const resetURL = `Hi, Please follow this link to reset your password. link is valid till 10 min.<a href='http://localhost:3000/reset-password/${token}'>Click here</a>`;
        const data = {
            to: email,
            subject: "Change password",
            text: "Hi, forgot password? No worry, here is the link.",
            htm: resetURL,
        }
        sendMail(data);
        res.json({ success: true, message: "Email sent to your email address." });
    } catch (error) {
        throw new Error(error);
    }
});

const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest("hex");
    const currDate = new Date();
    const user = await User.findOne({
        passwordResetExpire: { $gt: currDate },
        passwordResetToken: hashedToken,
    });

    if (!user) throw new Error("Token expired, Please try again later.");
    user.password = password;
    user.passwordResetToken = user.passwordResetExpire = undefined;
    await user.save();
    res.send(user);
});

const getWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbID(_id);
    try {
        const findUser = await User.findById(_id).populate("wishlist").populate({
            path: "wishlist",
            populate: {
                path: "brand",
                model: "Brand",
            }
        }).select("wishlist").exec();

        const wishlist = findUser.wishlist.map(prod => {
            return {
                _id: prod._id,
                title: prod.title,
                price: prod.price,
                brand: prod.brand.title,
                quantity: prod.quantity,
                images: prod.images,
            }
        });
        res.json(wishlist);
    } catch (error) {
        throw new Error(error);
    }
});

const saveAddress = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbID(_id);
    const { address } = req.body;
    try {
        const updatedAddressUser = await User.findByIdAndUpdate(_id, {
            address: address
        }, { new: true });
        res.json(updatedAddressUser);
    } catch (error) {
        throw new Error(error);
    }
});

const userCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbID(_id);
    const { productId, color, quantity, price } = req.body;
    try {
        const product = await Cart.findOne({ productId: productId, userId: _id });
        let result = "";
        if (product) {
            result = await Cart.findOneAndUpdate
                ({ productId: productId, userId: _id }, {
                    quantity: quantity,
                }, { new: true });
        } else {
            const addToCart = new Cart({
                userId: _id,
                productId: productId,
                color,
                quantity,
                price,
            })
            result = await addToCart.save();
        }
        const getCart = await Cart.find({ userId: _id }).populate('productId').populate("color").exec();
        res.json({result, cart:getCart});
    } catch (error) {
        throw new Error(error);
    }
});

const getCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbID(_id);
    try {
        const getCart = await Cart.find({ userId: _id }).populate('productId').populate("color").exec();
        res.json(getCart);
    } catch (error) {
        throw new Error(error);
    }
});

const removeProductFromCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbID(_id);
    const { id } = req.params;
    validateMongodbID(id);
    try {
        const deleteProduct = await Cart.findOneAndDelete({ userId: _id, productId: id });
        const cart = await Cart.find({userId: _id});
        res.json({deleteProduct,cart});
    } catch (error) {
        throw new Error(error);
    }
});

const updateCartProduct = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbID(_id);
    const { productId, quantity } = req.body;
    try {
        const updatedCart = await Cart.findOneAndUpdate({ userId: _id, productId }, { $set: { quantity: parseInt(quantity) } }, { new: true });        
        const cart = await Cart.find({userId: _id});
        res.json({updatedCart,cart});
    } catch (error) {
        throw new Error(error);
    }
});

const clearCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbID(_id);
    try {
        const deleteCart = await Cart.findOneAndDelete({ orderedBy: _id });
        res.json(deleteCart);
    } catch (error) {
        throw new Error(error);
    }
});

const applyCoupon = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbID(_id);
    const { coupon } = req.body;
    try {
        const findCoupon = await Coupon.findOne({ name: coupon });
        if (!findCoupon) {
            throw new Error("Coupon Not Found!");
        }
        const findCart = await Cart.findOne({ orderedBy: _id });
        let totalAfterDiscount = (findCart.cartTotal - ((findCart.cartTotal * findCoupon.discount) / 100)).toFixed(2);
        const resultedCart = await Cart.findByIdAndUpdate(findCart._id, {
            totalAfterDiscount
        }, { new: true });
        res.json(totalAfterDiscount);
    } catch (error) {
        throw new Error(error);
    }
});

const makeOrder = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbID(_id);
    const { shippingInfo, orderItems, totalPrice, totalPriceAfterDiscount, paymentInfo, paidAt } = req.body;
    console.log(req.body);

    try {
        const findOrder = await Order.findOne({ userId: _id });
        if (findOrder) {
            res.json({ findOrder, success: false });
        } else {
            const newOrder = new Order({
                user: _id,
                shippingInfo,
                orderItems,
                totalPrice,
                totalPriceAfterDiscount,
                paymentInfo,
                paidAt,
            });
            const saveOrder = await newOrder.save();
            res.json({ saveOrder, success: true });
        }
    } catch (error) {
        throw new Error(error);
    }
});

const getOrder = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbID(_id);
    try {
        const findOrder = await Order.find({ orderedBy: _id }).populate('products.product').exec();
        // const findOrder = await Order.findOne({orderedBy:_id});
        res.json(findOrder);
    } catch (error) {
        throw new Error(error);
    }
});

const getMyOrders = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbID(_id);
    try {
        const findOrder = await Order.find({ user: _id }).populate('orderItems.product').populate("orderItems.color").exec();
        res.json(findOrder);
    } catch (error) {
        throw new Error(error);
    }
});

const getAllOrder = asyncHandler(async (req, res) => {
    try {
        const findOrder = await Order.find().populate('orderItems.product').populate("orderItems.color").populate('user').exec();
        res.json(findOrder);
    } catch (error) {
        throw new Error(error);
    }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbID(_id);
    const { status } = req.body;
    const { id } = req.params;
    try {
        const updatedStatus = await Order.findByIdAndUpdate(id, {
            orderStatus: status,
        }, { new: true });
        res.json(updatedStatus);
    } catch (error) {
        throw new Error(error);
    }
});

const getUnblockedCustomers = asyncHandler(async (req, res) => {
    try {
        const unblockedCustomers = await User.find({ isBlocked: "false" });
        res.json(unblockedCustomers);
    } catch (error) {
        throw new Error(error);
    }
});

const getBlockedCustomers = asyncHandler(async (req, res) => {
    try {
        const blockedCustomers = await User.find({ isBlocked: "true" });
        res.json(blockedCustomers);
    } catch (error) {
        throw new Error(error);
    }
});

const getMonthWiseOrderIncome = asyncHandler(async (req, res) => {
    let monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    let d = new Date();
    let endDate = "";
    d.setDate(1);
    for (let i = 0; i < 11; i++) {
        d.setMonth(d.getMonth() - 1);
        endDate = monthNames[d.getMonth()] + " " + d.getFullYear();
    }
    try {
        const orderIncome = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $lte: new Date(),
                        $gte: new Date(endDate),
                    }
                }
            },
            {
                $group: {
                    _id: { month: "$month" },
                    total: { $sum: "$totalPriceAfterDiscount" },
                    count: { $sum: 1 },
                }
            }, {
                $sort: { "_id.month": 1 }
            }
        ]);
        res.json(orderIncome);
    } catch (error) {
        throw new Error(error);
    }
});


const getYearlyOrder = asyncHandler(async (req, res) => {
    let monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    let d = new Date();
    let endDate = "";
    d.setDate(1);
    for (let i = 0; i < 11; i++) {
        d.setMonth(d.getMonth() - 1);
        endDate = monthNames[d.getMonth()] + " " + d.getFullYear();
    }
    try {
        const orderIncome = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $lte: new Date(),
                        $gte: new Date(endDate),
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalCount: { $sum: 1 },
                    totalIncome: { $sum: "$totalPriceAfterDiscount" },
                }
            }
        ]);
        res.json(orderIncome);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    createUser,
    loginUser,
    loginAdmin,
    updateProfile,
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
    userCart,
    getCart,
    removeProductFromCart,
    clearCart,
    applyCoupon,
    makeOrder,
    getOrder,
    getMyOrders,
    getAllOrder,
    updateOrderStatus,
    getUnblockedCustomers,
    getBlockedCustomers,
    updateCartProduct,
    getMonthWiseOrderIncome,
    getYearlyOrder,

};
