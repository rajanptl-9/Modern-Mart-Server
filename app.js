const express = require('express')
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const dbConnection = require('./config/dbConnection');

const authRoute = require('./routes/authRoute');
const productRoute = require('./routes/productRoute');
const prodCategoryRoute = require('./routes/prodCategoryRoute');
const brandRoute = require('./routes/brandRoute');
const couponRoute = require('./routes/couponRoute');
const colorRoute = require('./routes/colorRoute');
const enquiryRoute = require('./routes/enquiryRoute');

const { notFound, errorHandler } = require('./middlewares/errorHandler');

const PORT = process.env.PORT || 8080;
const app = express()

dbConnection();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api/user',authRoute);
app.use('/api/product',productRoute);
app.use('/api/category',prodCategoryRoute);
app.use('/api/brand',brandRoute);
app.use('/api/coupon',couponRoute);
app.use('/api/color',colorRoute);
app.use('/api/enquiry',enquiryRoute);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
