const express = require('express')
const dotenv = require('dotenv').config();
const dbConnection = require('./config/dbConnection');
const PORT = process.env.PORT || 8080;
const authRoute = require('./routes/authRoute');
const productRoute = require('./routes/productRoute');
const bodyParser = require('body-parser');
const prodCategoryRoute = require('./routes/prodCategoryRoute');
const brandRoute = require('./routes/brandRoute');
const couponRoute = require('./routes/couponRoute');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
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
app.use('/api/coupon',couponRoute)

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
