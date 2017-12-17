const express = require('express');
const request = require('request');
const JSON = require('../dev/jsonfn');

const router = new express.Router();

const Function = require('../models/function');

router.all('/', (req, res) => {
  res.send('Hello. This is the path to search by meaning. Detailed information can be found <a href=https://github.com/cbmjs/CallByMeaning/>here</a>. Check <a href=../gbm/search>/search</a>');
});

router.get('/search', (req, res) => {
  res.send('This is the path to use for searching. Send a POST request with the parameters in its body.');
});

router.post('/search', (req, res) => {
  req.body.inputNodes = req.body.inputNodes || [];
  if (req.body.outputNodes == null) return res.status(400).send('A function must have at least one output');
  const inputNodes = req.body.inputNodes instanceof Object ? req.body.inputNodes : req.body.inputNodes.split(' ').join('').split(',');
  const outputNodes = req.body.outputNodes instanceof Object ? req.body.outputNodes : req.body.outputNodes.split(' ').join('').split(',');
  Function.find({ argsNames: inputNodes, returnsNames: outputNodes }, (err, funcs) => {
    if (err) console.log(err);
    if (funcs.length !== 0) {
      const temp = [];
      for (let t = 0; t < funcs.length; t += 1) {
        temp.push({ function: funcs[t].codeFile, desc: funcs[t].desc });
      }
      return res.json(temp);
    }
    for (let i = 0; i < outputNodes.length; i += 1) {
      if (res.headersSent) break;
      request.get(`${req.protocol}://${req.get('host')}${req.originalUrl[0]}gbn/c/${outputNodes[i]}`, (err2, response, body) => {
        if (response.statusCode !== 200) return res.status(418).send(`Could not interpret the node: ${outputNodes[i]}`);
        outputNodes[i] = JSON.parse(body).name;
        if (i === outputNodes.length - 1) {
          if (inputNodes.length === 0) {
            Function.find({ argsNames: inputNodes, returnsNames: outputNodes }, (err3, funcs2) => {
              if (err3) console.log(err);
              if (funcs2.length !== 0) {
                const temp = [];
                for (let t = 0; t < funcs2.length; t += 1) {
                  temp.push({ function: funcs2[0].codeFile, desc: funcs[0].desc });
                }
                return res.json(temp);
              }
              return res.status(418).send('Function not found.');
            });
          } else {
            for (let j = 0; j < inputNodes.length; j += 1) {
              if (res.headersSent) break;
              request.get(`${req.protocol}://${req.get('host')}${req.originalUrl[0]}gbn/c/${inputNodes[j]}`, (err3, response2, body2) => {
                if (response2.statusCode !== 200) return res.status(418).send(`Could not interpret the node: ${inputNodes[j]}`);
                outputNodes[i] = JSON.parse(body2).name;
                if (j === inputNodes.length - 1) {
                  Function.find({ argsNames: inputNodes, returnsNames: outputNodes }, (err4, funcs2) => {
                    if (err4) console.log(err4);
                    if (funcs2.length !== 0) {
                      const temp = [];
                      for (let t = 0; t < funcs2.length; t += 1) {
                        temp.push({ function: funcs2[0].codeFile, desc: funcs2[0].desc });
                      }
                      return res.json(temp);
                    }
                    return res.status(418).send('Function not found.');
                  });
                }
              });
            }
          }
        }
      });
    }
  });
});

module.exports = router;
