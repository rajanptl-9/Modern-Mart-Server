const jwt = require('jsonwebtoken');

const getSignedJwtToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {expiresIn:"1d"});    
}

module.exports = {getSignedJwtToken};