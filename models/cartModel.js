const mongoose = require('mongoose');

var cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: { type: Number, default: 1, required : true },
    price: { type: Number, required: true },
    color: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Color",
    }
},{
    timestamps: true,
});

module.exports = mongoose.model('Cart', cartSchema);