const Product = require('../models/prodModel');
const asyncHandler = require("express-async-handler");
const slugify = require('slugify');

const createProduct = asyncHandler(async(req,res) => {
    try {
        if(req.body.title){
            req.body.slug = slugify(req.body.title);
        }
        const newProd = await Product.create(req.body);
        res.json(newProd);
    } catch (error) {
        throw new Error(error);
    }
});

const getOneProduct = asyncHandler(async(req,res) => {
    const { id } = req.params;
    try {
        const prod = await Product.findById(id);
        res.json(prod);
    } catch (error) {
        throw new Error(error);
    }
});

const getAllProducts = asyncHandler(async(req,res) => {
    try {
        const prod = await Product.find();
        res.json(prod);
    } catch (error) {
        throw new Error(error);
    }

});

const updateProduct = asyncHandler(async(req,res) => {
    const { id } = req.params;
    try {
        if(req.body.title){
            req.body.slug = slugify(req.body.title);
        }
        const updateProd = await Product.findByIdAndUpdate(id,req.body,{new:true});
        res.json(updateProd);
    } catch (error) {
        throw new Error(error);
    }
});


const deleteProduct = asyncHandler(async(req,res) => {
    const { id } = req.params;
    try {
        const deleteProd = await Product.findByIdAndDelete(id);
        res.json(deleteProd);
    } catch (error) {
        throw new Error(error);
    }
});



module.exports = {
    createProduct,
    getOneProduct,
    getAllProducts,
    updateProduct,
    deleteProduct,
};