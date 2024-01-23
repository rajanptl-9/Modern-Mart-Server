const mongoose = require('mongoose'); 

var colorSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
},{
    timestamps: true,
});

module.exports = mongoose.model('Color', colorSchema);