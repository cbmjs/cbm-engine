/* eslint-disable consistent-return */
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

import express from "express";
import multer from "multer";

import Concept from "../models/concept.js";
import Functionn from "../models/function.js";
import Relation from "../models/relation.js";
import { fixReferences, fixTests } from "../dev/fill-with-funcs.js";

const router = new express.Router();

router.all("/", (req, res) => {
	res.send("Hello. From this path you can add new thing to the DB by sending a POST request to /concept, /function or /relation.");
});

router.post("/concept", (req, res) => {
	const { name } = req.body;
	const desc = req.body.desc || "";
	let units = req.body.units || [];
	units = Array.isArray(units) ? units : [units];
	Concept.findOne({ name }, (err, concept) => {
		if (err) {
			console.error(err);
		}

		if (concept) {
			concept.units = [...concept.units, ...units];
			concept.markModified("units");
			concept.save((err2) => {
				if (err2) {
					console.error(err2);
				}
			});
			return res.status(200).send("Concept added.");
		}

		Concept.create({ name, desc, units }, (err2, concept2) => {
			if (err2) {
				console.error(err2);
			}

			if (concept2) {
				return res.status(200).send("Concept added.");
			}

			return res.status(418).send("Something went wrong.");
		});
	});
});

router.post("/function", multer().any(), (req, res) => {
	const desc = req.body.desc || "";
	const isAPI = req.body.isApi ? JSON.parse(req.body.isApi) : false;
	let argsNames = req.body.argsNames || [];
	argsNames = Array.isArray(argsNames) ? argsNames : [argsNames];
	let argsUnits = req.body.argsUnits || [];
	argsUnits = Array.isArray(argsUnits) ? argsUnits : [argsUnits];
	let returnsNames = req.body.returnsNames || [];
	returnsNames = Array.isArray(returnsNames) ? returnsNames : [returnsNames];
	let returnsUnits = req.body.returnsUnits || [];
	returnsUnits = Array.isArray(returnsUnits) ? returnsUnits : [returnsUnits];
	let codeFile;
	for (const [i, element] of argsNames.entries()) {
		if (argsUnits[i] === null || argsUnits[i] === undefined || argsUnits[i] === "-" || argsUnits[i] === "") {
			argsUnits[i] = element;
		}
	}

	for (const [i, element] of returnsNames.entries()) {
		if (returnsUnits[i] === null || returnsUnits[i] === undefined || returnsUnits[i] === "-" || returnsUnits[i] === "") {
			returnsUnits[i] = element;
		}
	}

	if (isAPI) {
		codeFile = `${req.body.name}.js`;
		const apiFunc = `const request = require('sync-request');\n\nmodule.exports = (...args) => {\nlet uri = '${
			req.body.api_link}';\nconst argsToreplace = ${JSON.stringify(argsNames)};\nargsToreplace.forEach((el, index) ${
			" "}=> { uri = uri.replace(el, args[index]); });\nconst res = request('GET', uri);\nreturn res.getBody('utf8');\n};`;
		fs.writeFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "../../library", codeFile), apiFunc);
	} else {
		codeFile = req.files?.[0]?.originalName || "default.js";
		req.files?.[0]?.stream?.pipe?.(fs.createWriteStream(path.join(path.dirname(fileURLToPath(import.meta.url)), "../../library", codeFile)));
	}

	Functionn.findOne({ name: req.body.name }, (err, func) => {
		if (err) {
			console.error(err);
		}

		if (func) {
			func.argsNames = argsNames;
			func.argsUnits = argsUnits;
			func.returnsNames = returnsNames;
			func.returnsUnits = returnsUnits;
			func.codeFile = codeFile || "default.js";
			func.markModified("argsNames");
			func.markModified("argsUnits");
			func.markModified("returnsNames");
			func.markModified("returnsUnits");
			func.markModified("codeFile");
			func.save((err2) => {
				if (err2) {
					console.error(err2);
				}
			});
			return res.status(200).send("Functionn added.");
		}

		Functionn.create({
			name: req.body.name,
			desc,
			argsNames,
			argsUnits,
			returnsNames,
			returnsUnits,
			codeFile,
		}, (err2, func2) => {
			if (err2) {
				console.error(err2);
			}

			if (func2) {
				return res.status(200).send("Functionn added.");
			}

			return res.status(418).send("Something went wrong.");
		});
	});
});

router.post("/relation", (req, res) => {
	const { name } = req.body;
	const desc = req.body.desc || "";
	const start = req.body.start || "";
	const end = req.body.end || "";
	const mathRelation = req.body.mathRelation || "start";
	const connects = start === "" || end === "" ? [] : [{ start: { name: start }, end: { name: end }, mathRelation }];
	Relation.findOne({ name }, (err, relation) => {
		if (err) {
			console.error(err);
		}

		if (relation) {
			relation.connects = [...relation.connects, ...connects];
			relation.markModified("connects");
			relation.save((err2) => {
				if (err2) {
					console.error(err2);
				}
			});
			return res.status(200).send("Relation added.");
		}

		Relation.create({
			name,
			desc,
			connects,
			mathRelation,
		}, (err2, relation2) => {
			if (err2) {
				console.error(err2);
			}

			if (relation2) {
				return res.status(200).send("Relation added.");
			}

			return res.status(418).send("Something went wrong.");
		});
	});
});

router.post("/fix", async (req, res) => {
	if (req.body.command === "fixit") {
		try {
			await fixReferences();
		} catch (error) {
			console.error(error);
		}
	}

	if (req.body.command === "fixtests") {
		await fixTests();
	}

	return res.send("cool bro");
});

export default router;
