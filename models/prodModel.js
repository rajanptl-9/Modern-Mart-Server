const mongoose = require('mongoose'); 

var productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim: true,
    },
    slug:{
        type:String,
        required:true,
        unique:true,
        lowercase: true,
    },
    description:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Category",
        require: true,
    },
    brand: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "Brand",
        require: true,
    },
    quantity : {
        type: Number ,
        required:true,
    },
    sold:{
        type: Number,
        default: 0,
    },
    images:[
        {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
        }
    ],
    color:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Color"
    }],
    tags:[],
    rating:[{
        star: Number,
        comments: String,
        name: String,
        email: String,
        title: String,
        createdAt:{
            type:Date,
            default: Date.now,
        }        
    }],
    totalRating:{
        type: String,
        default: 0,
    }
},{
    timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);