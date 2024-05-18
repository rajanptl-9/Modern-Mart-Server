const mongoose = require('mongoose');

var orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    shippingInfo: {
        firstname: {
            type: String,
            required: true,
        },
        lastname: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        other: {
            type: String,
            required: true,
        },
        pincode: {
            type: Number,
            required: true,
        },
    },
    paymentInfo:{
        razorpayPaymentId:{
            type:String,
            required:true,
        },
        // razorpayOrderId:{
        //     type:String,
        //     required:true,
        // },
    },
    orderItems: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            color:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Color",
                required: true,
            },
            price:{
                type: Number,
                required: true,
            }
        },
    ],
    paidAt:{
        type:Date,
        default: Date.now(),
    },
    month:{
        type: String,
        default: new Date().getMonth(),
    },
    totalPrice:{
        type:Number,
        required:true,
    },
    totalPriceAfterDiscount:{
        type:Number,
        required:true,
    },
    orderStatus:{
        type:String,
        default:"Ordered",
        enum: ['Ordered', "Shipping", 'Out-of-Delivery', 'Delivered','Cancelled'],
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);