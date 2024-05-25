const Brand = require('../models/brandModel');
const asyncHandler = require('express-async-handler');
const validateMongodbID = require('../utils/validateMongodbID');

const createBrand = asyncHandler(async(req,res) => {
    try {
        const newBrand = await Brand.create(req.body);
        res.json(newBrand);
    } catch (error) {
        throw new Error(error);
    }
});

const updateBrand = asyncHandler(async(req,res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {       
        const updateBrand = await Brand.findByIdAndUpdate(id,req.body,{new:true});
        res.json(updateBrand);
    } catch (error) {
        throw new Error(error);
    }
});

const deleteBrand = asyncHandler(async(req,res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {       
        const deleteBrand = await Brand.findByIdAndDelete(id);
        res.json(deleteBrand);
    } catch (error) {
        throw new Error(error);
    }
});

const getOneBrand = asyncHandler(async(req,res) => {
    try {
        const {id} = req.params;
        const getOneBrand = await Brand.findById(id);
        res.json(getOneBrand);
    } catch (error) {
        throw new Error(error);
    }
});
const getAllBrand = asyncHandler(async(req,res) => {
    try {
        const getAllBrand = await Brand.find();
        res.json(getAllBrand);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports =  {
    createBrand,
    updateBrand,
    deleteBrand,
    getOneBrand,
    getAllBrand,
};
