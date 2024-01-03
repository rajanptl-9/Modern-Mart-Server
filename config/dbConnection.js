const {mongoose} = require('mongoose')

const dbConnection = () => {
    try{
        mongoose.connect(process.env.MONGODB_URL);
        console.log("Database connected successfully");
    }catch(err){
        console.log(`MongoDB connection error ${err}`);
    }
}

module.exports = dbConnection;