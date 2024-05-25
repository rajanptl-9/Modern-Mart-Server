const mongoose = require('mongoose');

const validateMongodbID = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid MongoDB ID');
  }
}

module.exports = validateMongodbID;
