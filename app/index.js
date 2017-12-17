require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;

mongoose.connect(process.env.DB_HOST || 'mongodb://localhost:27017/'.concat(process.env.DB || 'callbymeaning'), { useMongoClient: true });
mongoose.Promise = global.Promise;
if (!fs.existsSync(path.join(__dirname, '../logs/'))) fs.mkdirSync(path.join(__dirname, '../logs/'));
const accessLogStream = fs.createWriteStream(path.join(__dirname, '../logs/access.log'), { flags: 'a' });

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/js', express.static(path.join(__dirname, '../library')));
app.use('/internal', express.static(path.join(__dirname, '../library/internal')));
app.use('/docs', express.static(path.join(__dirname, '../docs')));
app.use(morgan('dev', { stream: accessLogStream }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/', (req, res) => {
  res.send('<h1>Hello There :)</h1><br>Check <a href=./gbn>Get by name</a><br>Check <a href=./gbm>Get by meaning</a><br>Check <a href=./cbm>Call by meaning</a>');
});

app.use('/new', require('./routes/newRoutes'));
app.use('/all', require('./routes/displayAllRoutes'));
app.use('/gbn', require('./routes/getByNameRoutes'));
app.use('/gbm', require('./routes/getByMeaningRoutes'));
app.use('/cbm', require('./routes/callByMeaningRoutes'));

app.all('*', (req, res) => res.status(404).send('Hmm... How did you end up here?'));

const server = app.listen(port, () => {
  // eslint-disable-next-line eqeqeq
  if (process.env.ON_HEROKU == 1) {
    console.log(`Server ${chalk.green('started')}. Have fun. 😀`);
  } else {
    console.log(`Server ${chalk.green('started')} at http://localhost:${port}. Have fun. 😀`);
  }
});

exports.close = () => {
  mongoose.connection.close();
  server.close();
};
