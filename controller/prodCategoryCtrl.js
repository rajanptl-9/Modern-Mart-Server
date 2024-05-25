const Category = require('../models/prodCategoryModel');
const asyncHandler = require('express-async-handler');
const validateMongodbID = require('../utils/validateMongodbID');

const createCategory = asyncHandler(async(req,res) => {
    try {
        const newCategory = await Category.create(req.body);
        res.json(newCategory);
    } catch (error) {
        throw new Error(error);
    }
});

const updateCategory = asyncHandler(async(req,res) => {
    const {id} = req.params;
    try {       
        validateMongoDbId(id);
        const updateCategory = await Category.findByIdAndUpdate(id,req.body,{new:true});
        res.json(updateCategory);
    } catch (error) {
        throw new Error(error);
    }
});

const deleteCategory = asyncHandler(async(req,res) => {
    const {id} = req.params;
    try {       
        validateMongoDbId(id);
        const deleteCategory = await Category.findByIdAndDelete(id);
        res.json(deleteCategory);
    } catch (error) {
        throw new Error(error);
    }
});

const getOneCategory = asyncHandler(async(req,res) => {
    try {
        const {id} = req.params;
        const getOneCategory = await Category.findById(id);
        res.json(getOneCategory);
    } catch (error) {
        throw new Error(error);
    }
});
const getAllCategory = asyncHandler(async(req,res) => {
    try {
        const getAllCategory = await Category.find();
        res.json(getAllCategory);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports =  {
    createCategory,
    updateCategory,
    deleteCategory,
    getOneCategory,
    getAllCategory,
};