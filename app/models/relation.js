const mongoose = require('mongoose');

const relationSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
  },
  desc: String,
  connects: [{
    start: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Node',
      },
      name: String,
    },
    end: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Node',
      },
      name: String,
    },
    mathRelation: String,
  }],
}, { usePushEach: true });

mongoose.pluralize(null);
const model = mongoose.model('Relation', relationSchema);

module.exports = model;
