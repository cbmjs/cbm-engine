/* eslint-disable camelcase */

const mongoose = require('mongoose');

const conceptSchema = new mongoose.Schema({
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

mongoose.pluralize(null);
const model = mongoose.model('Concept', conceptSchema);

module.exports = model;
