const mongoose = require('mongoose');

function validateMongodbID(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid MongoDB ID');
  }
}

module.exports = validateMongodbID;
