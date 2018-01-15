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
  req.body.inputConcepts = req.body.inputConcepts || [];
  if (req.body.outputConcepts == null || req.body.outputConcepts.length === 0) return res.status(400).send('A function must have at least one output');
  const inputConcepts = req.body.inputConcepts instanceof Object ? req.body.inputConcepts : req.body.inputConcepts.split(' ').join('').split(',');
  const outputConcepts = req.body.outputConcepts instanceof Object ? req.body.outputConcepts : req.body.outputConcepts.split(' ').join('').split(',');
  Function.find({ argsNames: inputConcepts, returnsNames: outputConcepts }, (err, funcs) => {
    if (err) console.log(err);
    if (funcs.length !== 0) {
      const temp = [];
      for (let t = 0; t < funcs.length; t += 1) {
        temp.push({ function: funcs[t].codeFile, desc: funcs[t].desc });
      }
      return res.json(temp);
    }
    for (let i = 0; i < outputConcepts.length; i += 1) {
      if (res.headersSent) break;
      request.get(`${req.protocol}://${req.get('host')}${req.originalUrl[0]}gbn/c/${outputConcepts[i]}`, (err2, response, body) => {
        if (response.statusCode !== 200) return res.status(418).send(`Could not interpret the concept: ${outputConcepts[i]}`);
        outputConcepts[i] = JSON.parse(body).name;
        if (i === outputConcepts.length - 1) {
          if (inputConcepts.length === 0) {
            Function.find({ argsNames: inputConcepts, returnsNames: outputConcepts }, (err3, funcs2) => {
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
            for (let j = 0; j < inputConcepts.length; j += 1) {
              if (res.headersSent) break;
              request.get(`${req.protocol}://${req.get('host')}${req.originalUrl[0]}gbn/c/${inputConcepts[j]}`, (err3, response2, body2) => {
                if (response2.statusCode !== 200) return res.status(418).send(`Could not interpret the concept: ${inputConcepts[j]}`);
                outputConcepts[i] = JSON.parse(body2).name;
                if (j === inputConcepts.length - 1) {
                  Function.find({ argsNames: inputConcepts, returnsNames: outputConcepts }, (err4, funcs2) => {
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
