const mongoose = require('mongoose');

const validateMongoDBId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid MongoDB ID');
  }
}

module.exports = validateMongoDBId;
