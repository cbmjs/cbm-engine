/* eslint-disable no-param-reassign */
const express = require('express');
const fs = require('fs');
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

const Concept = require('../models/concept');
const Function = require('../models/function');
const Relation = require('../models/relation');

const fix = require('../dev/fillWithFuncs');

router.all('/', (req, res) => {
	res.send('Hello. From this path you can add new thing to the DB by sending a POST request to /concept, /function or /relation.');
});

router.post('/concept', (req, res) => {
	const name = req.body.name;
	const desc = req.body.desc || '';
	let units = req.body.units || [];
	units = units instanceof Object ? units : units.split(' ').join('').split(',');
	Concept.findOne({ name }, (err, concept) => {
		if (err) console.error(err);
		if (concept) {
			concept.units = concept.units.concat(units);
			concept.markModified('units');
			concept.save((err2) => {
				if (err2) console.error(err2);
			});
			return res.status(200).send('Concept added.');
		}
		Concept.create({ name, desc, units }, (err2, concept2) => {
			if (err2) console.error(err2);
			if (concept2.length !== 0) return res.status(200).send('Concept added.');
			return res.status(418).send('Something went wrong.');
		});
	});
});

router.post('/function', upload.any(), (req, res) => {
	const name = req.body.name;
	const desc = req.body.desc || '';
	const isAPI = req.body.isApi ? JSON.parse(req.body.isApi) : false;
	let argsNames = req.body.argsNames || [];
	argsNames = argsNames instanceof Object ? argsNames : argsNames.split(' ').join('').split(',');
	let argsUnits = req.body.argsUnits || [];
	argsUnits = argsUnits instanceof Object ? argsUnits : argsUnits.split(' ').join('').split(',');
	let returnsNames = req.body.returnsNames || [];
	returnsNames = returnsNames instanceof Object ? returnsNames : returnsNames.split(' ').join('').split(',');
	let returnsUnits = req.body.returnsUnits || [];
	returnsUnits = returnsUnits instanceof Object ? returnsUnits : returnsUnits.split(' ').join('').split(',');
	let codeFile;
	for (let i = 0; i < argsNames.length; i += 1) {
		if (argsUnits[i] == null || argsUnits[i] === '-' || argsUnits[i] === '') argsUnits[i] = argsNames[i];
	}
	for (let i = 0; i < returnsNames.length; i += 1) {
		if (returnsUnits[i] == null || returnsUnits[i] === '-' || returnsUnits[i] === '') returnsUnits[i] = returnsNames[i];
	}
	if (!isAPI) {
		codeFile = (req.files && req.files[0].originalname) ? req.files[0].originalname : 'default.js';
	} else {
		codeFile = `${name}.js`;
		const apiFunc = `const request = require('sync-request');\n\nmodule.exports = (...args) => {\nlet uri = '${req.body.api_link}';\nconst argsToreplace = ${JSON.stringify(argsNames)};\nargsToreplace.forEach((el, index) => { uri = uri.replace(el, args[index]); });\nconst res = request('GET', uri);\nreturn res.getBody('utf8');\n};`;
		fs.writeFileSync(path.join(__dirname, '../../library', codeFile), apiFunc);
	}

	Function.findOne({ name }, (err, func) => {
		if (err) console.error(err);
		if (func) {
			func.argsNames = argsNames;
			func.argsUnits = argsUnits;
			func.returnsNames = returnsNames;
			func.returnsUnits = returnsUnits;
			func.codeFile = codeFile || 'default.js';
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
