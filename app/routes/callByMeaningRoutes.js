const express = require('express');
const request = require('request');
const math = require('mathjs');
const JSON = require('../dev/jsonfn');

const router = new express.Router();

const Function = require('../models/function');
const Relation = require('../models/relation');

router.all('/', (req, res) => {
  res.send('Hello. This is the path to call a function by meaning. Detailed information can be found <a href=https://github.com/cbmjs/CallByMeaning/>here</a>. Check <a href=../cbm/call>this</a>');
});

router.get('/call', (req, res) => {
  res.send('This is the path to use for calling. Send a POST request with the parameters in its body.');
});

router.post('/call', (req, res) => {
  req.body.inputNodes = req.body.inputNodes || [];
  req.body.inputUnits = req.body.inputUnits || [];
  req.body.inputVars = req.body.inputVars || [];
  req.body.outputNodes = req.body.outputNodes || [];
  req.body.outputUnits = req.body.outputUnits || [];
  // eslint-disable-next-line eqeqeq
  const returnCode = (req.headers.returncode == 'true');
  const inputNodes = req.body.inputNodes instanceof Object ? req.body.inputNodes : req.body.inputNodes.split(' ').join('').split(',');
  const inputUnits = req.body.inputUnits instanceof Object ? req.body.inputUnits : req.body.inputUnits.split(' ').join('').split(',');
  let inputVars = req.body.inputVars instanceof Object ? req.body.inputVars : req.body.inputVars.split(' ').join('').split(',');
  inputVars = inputVars.map((inputVar) => {
    try {
      return JSON.parse(inputVar);
    } catch (e) {
      return inputVar;
    }
  });
  const outputNodes = req.body.outputNodes instanceof Object ? req.body.outputNodes : req.body.outputNodes.split(' ').join('').split(',');
  const outputUnits = req.body.outputUnits instanceof Object ? req.body.outputUnits : req.body.outputUnits.split(' ').join('').split(',');

  for (let i = 0; i < inputNodes.length; i += 1) {
    if (inputUnits[i] == null || inputUnits[i] === '-' || inputUnits[i] === '') inputUnits[i] = inputNodes[i];
  }
  for (let i = 0; i < outputNodes.length; i += 1) {
    if (outputUnits[i] == null || outputUnits[i] === '-' || outputUnits[i] === '') outputUnits[i] = outputNodes[i];
  }

  if (outputNodes == null || outputNodes.length !== outputUnits.length) {
    return res.status(400).send('A function must have at least one output and every output must have its unit.');
  }
  if (inputNodes.length !== inputUnits.length) {
    return res.status(400).send('Input parameters must have the same length.');
  }
  request.post({ uri: `${req.protocol}://${req.get('host')}${req.originalUrl[0]}gbm/search/`, form: { inputNodes, outputNodes } }, (err, response, body) => {
    if (err) console.error(err);
    if (response.statusCode !== 200) return res.status(response.statusCode).send(body);
    Function.find({ codeFile: { $in: JSON.parse(body).map(item => item.function) }, argsUnits: inputUnits, returnsUnits: outputUnits }).populate('results').exec((err2, funcs) => {
      if (err2) console.error(err2);
      if (funcs.length !== 0) {
        const func = funcs[0]; // Only possibility
        if (returnCode) {
          const codeRes = {
            function: func.codeFile,
            description: func.desc,
          };
          return res.json(codeRes);
        }
        // eslint-disable-next-line
        const funcToRun = require('../../library/' + func.codeFile);
        const funcResult = funcToRun(...inputVars);
        return res.send(JSON.stringify(funcResult));
      }
      Function.find({ codeFile: { $in: JSON.parse(body).map(item => item.function) } }).populate('results').exec((err3, funcs2) => {
        if (err3) console.log(err3);
        Relation.findOne({ name: 'unitConversion' }, (err4, relation) => {
          if (err4) console.error(err4);
          let funcsChecked = 0;
          // eslint-disable-next-line no-restricted-syntax
          for (const func of funcs2) {
            funcsChecked += 1;
            const correctInputs = [];
            if (inputUnits.length !== 0) {
              for (let i = 0; i < inputUnits.length; i += 1) {
                if (func.argsUnits[i] === inputUnits[i]) {
                  correctInputs[i] = inputVars[i];
                } else {
                  let foundInputRelation = false;
                  try {
                    const inMath = math.unit(inputUnits[i]);
                    const argMath = math.unit(func.argsUnits[i]);
                    correctInputs[i] = inputVars[i] * math.to(argMath, inMath).toNumber();
                    foundInputRelation = true;
                  } catch (error) {
                    // eslint-disable-next-line no-restricted-syntax
                    for (const connection of relation.connects) {
                      if (connection.start.name === inputUnits[i] && connection.end.name === func.argsUnits[i]) {
                        foundInputRelation = true;
                        let mathRelation = connection.mathRelation;
                        mathRelation = mathRelation.replace('start', JSON.stringify(inputVars[i]));
                        correctInputs[i] = math.eval(mathRelation);
                        break;
                      }
                    }
                  }
                  if (!foundInputRelation) {
                    return res.status(418).send('There is a function whith these concepts, but given units can\'t be interpreted.');
                  }
                }
              }
            }
            // eslint-disable-next-line
            let funcToRun = require('../../library/' + func.codeFile);
            const funcResult = funcToRun(...correctInputs);
            if (func.returnsUnits[0] === outputUnits[0]) {
              if (returnCode) {
                const codeRes = {
                  function: func.codeFile,
                  desc: func.desc,
                };
                return res.json(codeRes);
              }
              return res.send(JSON.stringify(funcResult));
            }
            let foundOutputRelation = false;
            try {
              const outMath = math.unit(outputUnits[0]);
              const returnMath = math.unit(func.returnsUnits[0]);
              const mathRelation = funcResult * math.to(returnMath, outMath).toNumber();
              foundOutputRelation = true;
              if (returnCode) {
                const codeRes = {
                  function: func.codeFile,
                  description: func.desc,
                };
                return res.json(codeRes);
              }
              return res.send(JSON.stringify(mathRelation));
            } catch (error) {
              // eslint-disable-next-line no-restricted-syntax
              for (const connection of relation.connects) {
                if (connection.start.name === outputUnits[0] && connection.end.name === func.returnsUnits[0]) {
                  foundOutputRelation = true;
                  let mathRelation = connection.mathRelation;
                  mathRelation = mathRelation.replace('start', JSON.stringify(funcResult));
                  mathRelation = JSON.stringify(math.eval(mathRelation));
                  if (returnCode) {
                    const codeRes = {
                      function: func.codeFile,
                      description: func.desc,
                    };
                    return res.json(codeRes);
                  }
                  return res.send(mathRelation);
                }
              }
            }
            if (!foundOutputRelation) {
              return res.status(418).send('There is a function whith these concepts, but given units can\'t be interpreted.');
            }
            if (funcsChecked === funcs.length) return res.status(418).send('Function not found in DB.');
          }
        });
      });
    });
  });
});

module.exports = router;
