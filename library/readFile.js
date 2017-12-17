'use strict';

const fs = require('fs');

module.exports = (file) => {
  return fs.readFileSync(file, 'utf8');
};