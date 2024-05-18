const Product = require('../models/prodModel');
const User = require('../models/userModel');
const asyncHandler = require("express-async-handler");
const slugify = require('slugify');
const validateMongoDbId = require('../utils/validateMongodbID');
const fs = require('fs');

const createProduct = asyncHandler(async (req, res) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const newProd = await Product.create(req.body);
        res.json(newProd);
    } catch (error) {
        throw new Error(error);
    }
});

const getOneProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const prod = await Product.findById(id).populate("category").populate("brand").populate("color");
        res.json(prod);
    } catch (error) {
        throw new Error(error);
    }
});

const specificProducts = asyncHandler(async (req, res) => {

    const { tag, limit } = req.query;
    try {        
        const query = Product.find({
            tags : {$elemMatch : { $eq : tag}}
        }).sort("-createdAt");
        if (limit) {
            query.limit(parseInt(limit));
        }
        const prod = await query.populate("category").populate("brand").populate("color");
        res.json({ tag, prod });
    } catch (error) {
        throw new Error(error);
    }
})

const getAllProducts = asyncHandler(async (req, res) => {
    try {
        const queryObj = { ...req.query };

        //filtering query
        const removeFields = ['page', 'sort', 'limit', 'fields'];
        removeFields.forEach(param => delete queryObj[param]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        let query = Product.find(JSON.parse(queryStr));

        //sorting query
        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        } else {
            query = query.sort("-createdAt")
        }

        //limiting query
        if (req.query.fields) {
            const fields = req.query.fields.split(",").join(" ").trim();
            query = query.select(fields);
        } else {
            query = query.select("-__v");
        }

        //paginating query
        const page = req.query.page;
        const limit = req.query.limit || 12;
        const skip = (page - 1) * limit;
        const totalPagesQuery = query.clone();
        let totalProducts = await totalPagesQuery.countDocuments();

        query = query.skip(skip);
        if (limit !== Infinity) {
            query = query.limit(limit);
        }

        if (req.query.page) {
            if (skip >= totalProducts) throw new Error("This Page does not exists");
        }
        const totalPages = parseInt(totalProducts / limit) + (totalProducts % limit ? 1 : 0);
        const prod = await query.populate("category").populate("brand").populate('color');
        res.json({ prod, pages: totalPages });
    } catch (error) {
        throw new Error(error);
    }

});

const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const updateProd = await Product.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updateProd);
    } catch (error) {
        throw new Error(error);
    }
});

const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const deleteProd = await Product.findByIdAndDelete(id);
        res.json(deleteProd);
    } catch (error) {
        throw new Error(error);
    }
});

const addToWishlist = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { prodId } = req.body;
    validateMongoDbId(prodId);
    try {
        const user = await User.findById(id);
        const isPresent = user.wishlist.find((id) => id.toString() === prodId);
        if (isPresent) {
            let user = await User.findByIdAndUpdate(id, {
                $pull: { wishlist: prodId }
            }, { new: true });
            const updatedUser = await User.findById(id).populate("wishlist").populate({
                path: "wishlist",
                populate: {
                    path: "brand",
                    model: "Brand",
                }
            }).select("wishlist").exec();
            const wishlist = updatedUser.wishlist.map(prod => {
                return {
                    _id: prod._id,
                    title: prod.title,
                    price: prod.price,
                    brand: prod.brand.title,
                    quantity: prod.quantity,
                    images: prod.images,
                }
            });
            res.json({ wishlist, message: "Product Removed From Wishlist!" });
        } else {
            let user = await User.findByIdAndUpdate(id, {
                $push: { wishlist: prodId }
            }, { new: true });
            const updatedUser = await User.findById(id).populate("wishlist").populate({
                path: "wishlist",
                populate: {
                    path: "brand",
                    model: "Brand",
                }
            }).select("wishlist").exec();
            const wishlist = updatedUser.wishlist.map(prod => {
                return {
                    _id: prod._id,
                    title: prod.title,
                    price: prod.price,
                    brand: prod.brand.title,
                    quantity: prod.quantity,
                    images: prod.images,
                }
            });
            res.json({ wishlist, message: "Product Added To Wishlist!" });
        }
    } catch (error) {
        throw new Error(error);
    }
});

const userRating = asyncHandler(async (req, res) => {
    const { star, comments, prodId, email, name, title } = req.body;
    try {
        const product = await Product.findById(prodId);
        let isRatedByUser = product.rating.find(user => user.email === email);
        const createdAt = Date.now();

        if (isRatedByUser) {
            const updateRating = await Product.findOneAndUpdate({
                rating: { $elemMatch: { email: email } }
            }, {
                $set: { "rating.$.star": star, "rating.$.comments": comments, "rating.$.name": name, "rating.$.title": title, "rating.$.createdAt": createdAt },
            }, [{ 'elem.email': email }]);

        } else {
            const newRatedProduct = await Product.findByIdAndUpdate(prodId, {
                $push: {
                    rating: {
                        star: star,
                        comments: comments,
                        name: name,
                        title: title,
                        email: email,
                        createdAt,
                    },
                },
            }, { new: true });
        }
        const findProduct = await Product.findById(prodId);
        const countRating = findProduct.rating.length;
        let sumRating = findProduct.rating.map((item) => item.star).reduce((prev, curr) => prev + curr, 0);
        let finalRating = (sumRating / countRating).toFixed(1);
        console.log(finalRating);

        let updatedRatedProduct = await Product.findByIdAndUpdate(prodId, {
            totalRating: finalRating,
        }, { new: true });
        res.json(updatedRatedProduct.rating);

    } catch (error) {
        throw new Error(error);
    }
});


module.exports = {
    createProduct,
    getOneProduct,
    specificProducts,
    getAllProducts,
    updateProduct,
    deleteProduct,
    addToWishlist,
    userRating,
};