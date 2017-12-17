'use strict';

const fs = require('fs');

module.exports = (data, file) => {
  return fs.writeFileSync(file, data, ['utf8', 0o666, 'w+']);
};