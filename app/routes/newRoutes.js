/* eslint-disable no-param-reassign */
const express = require('express');
const path = require('path');
const multer = require('multer');

const router = new express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../library'));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

const Node = require('../models/node');
const Function = require('../models/function');
const Relation = require('../models/relation');

const fix = require('../dev/fillWithFuncs');

router.all('/', (req, res) => {
  res.send('Hello. From this path you can add new thing to the DB by sending a POST request to /node, /function or /relation.');
});

router.post('/node', (req, res) => {
  const name = req.body.name;
  const desc = req.body.desc || '';
  let units = req.body.units || [];
  units = units instanceof Object ? units : units.split(' ').join('').split(',');
  Node.findOne({ name }, (err, node) => {
    if (err) console.error(err);
    if (node) {
      node.units = node.units.concat(units);
      node.markModified('units');
      node.save((err2) => {
        if (err2) console.error(err2);
      });
      return res.status(200).send('Node added.');
    }
    Node.create({ name, desc, units }, (err2, node2) => {
      if (err2) console.error(err2);
      if (node2.length !== 0) return res.status(200).send('Node added.');
      return res.status(418).send('Something went wrong.');
    });
  });
});

router.post('/function', upload.any(), (req, res) => {
  const name = req.body.name;
  const desc = req.body.desc || '';
  let argsNames = req.body.argsNames || [];
  argsNames = argsNames instanceof Object ? argsNames : argsNames.split(' ').join('').split(',');
  let argsUnits = req.body.argsUnits || [];
  argsUnits = argsUnits instanceof Object ? argsUnits : argsUnits.split(' ').join('').split(',');
  let returnsNames = req.body.returnsNames || [];
  returnsNames = returnsNames instanceof Object ? returnsNames : returnsNames.split(' ').join('').split(',');
  let returnsUnits = req.body.returnsUnits || [];
  returnsUnits = returnsUnits instanceof Object ? returnsUnits : returnsUnits.split(' ').join('').split(',');
  const codeFile = (req.files && req.files[0].originalname) ? req.files[0].originalname : 'default.js';

  for (let i = 0; i < argsNames.length; i += 1) {
    if (argsUnits[i] == null || argsUnits[i] === '-' || argsUnits[i] === '') argsUnits[i] = argsNames[i];
  }
  for (let i = 0; i < returnsNames.length; i += 1) {
    if (returnsUnits[i] == null || returnsUnits[i] === '-' || returnsUnits[i] === '') returnsUnits[i] = returnsNames[i];
  }

  Function.findOne({ name }, (err, func) => {
    if (err) console.error(err);
    if (func) {
      func.argsNames = func.argsNames.concat(argsNames);
      func.argsUnits = func.argsUnits.concat(argsUnits);
      func.returnsNames = func.returnsNames.concat(returnsNames);
      func.returnsUnits = func.returnsUnits.concat(returnsUnits);
      if (codeFile !== 'default.js') func.codeFile = codeFile;
      func.markModified('argsNames');
      func.markModified('argsUnits');
      func.markModified('returnsNames');
      func.markModified('returnsUnits');
      func.markModified('codeFile');
      func.save((err2) => {
        if (err2) console.error(err2);
      });
      return res.status(200).send('Function added.');
    }
    Function.create({
      name,
      desc,
      argsNames,
      argsUnits,
      returnsNames,
      returnsUnits,
      codeFile,
    }, (err2, func2) => {
      if (err2) console.error(err2);
      if (func2.length !== 0) return res.status(200).send('Function added.');
      return res.status(418).send('Something went wrong.');
    });
  });
});

router.post('/relation', (req, res) => {
  const name = req.body.name;
  const desc = req.body.desc || '';
  const start = req.body.start || '';
  const end = req.body.end || '';
  const mathRelation = req.body.mathRelation || 'start';
  const connects = start === '' || end === '' ? [] : [{ start: { name: start }, end: { name: end }, mathRelation }];
  Relation.findOne({ name }, (err, relation) => {
    if (err) console.error(err);
    if (relation) {
      relation.connects = relation.connects.concat(connects);
      relation.markModified('connects');
      relation.save((err2) => {
        if (err2) console.error(err2);
      });
      return res.status(200).send('Relation added.');
    }
    Relation.create({
      name,
      desc,
      connects,
      mathRelation,
    }, (err2, relation2) => {
      if (err2) console.error(err2);
      if (relation2.length !== 0) return res.status(200).send('Relation added.');
      return res.status(418).send('Something went wrong.');
    });
  });
});

router.post('/fix', async (req, res) => {
  if (req.body.command === 'fixit') {
    try {
      await fix.fixReferences();
    } catch (error) {
      console.error(error);
    }
  }
  if (req.body.command === 'fixtests') {
    await fix.fixTests();
  }
  return res.send('cool bro');
});

module.exports = router;
