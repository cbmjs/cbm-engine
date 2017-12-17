const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
  },
  desc: String,
  units: [],
  func_arg: [{
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Function',
    },
    name: String,
    unitType: String,
  }],
  func_res: [{
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Function',
    },
    name: String,
    unitType: String,
  }],
}, { usePushEach: true });

module.exports = mongoose.model('Node', nodeSchema);
