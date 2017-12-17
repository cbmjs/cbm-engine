const mongoose = require('mongoose');

const functionSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
  },
  desc: String,
  codeFile: {
    type: String,
    default: 'default.js',
  },
  args: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node',
  }],
  returns: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node',
  }],
  argsNames: [],
  argsUnits: [],
  returnsNames: [],
  returnsUnits: [],
}, { usePushEach: true });

module.exports = mongoose.model('Function', functionSchema);
