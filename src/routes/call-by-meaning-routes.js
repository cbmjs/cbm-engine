/* eslint-disable import/no-dynamic-require */
import { createRequire } from "node:module";

import express from "express";
import request from "request";
import * as math from "mathjs";

import * as JSON from "../dev/jsonfn.js";
import Functionn from "../models/function.js";
import Relation from "../models/relation.js";

const require = createRequire(import.meta.url);

const router = new express.Router();

router.all("/", (req, res) => {
	res.send("Hello. This is the path to call a function by meaning. Detailed information can"
  + " be found <a href=https://github.com/cbmjs/cbm-engine/>here</a>. Check <a href=../cbm/call>this</a>");
});

router.get("/call", (req, res) => {
	res.send("This is the path to use for calling. Send a POST request with the parameters in its body.");
});

router.post("/call", (req, res) => {
	req.body.inputConcepts = req.body.inputConcepts || [];
	req.body.inputUnits = req.body.inputUnits || [];
	req.body.inputVars = req.body.inputVars || [];
	req.body.outputConcepts = req.body.outputConcepts || [];
	req.body.outputUnits = req.body.outputUnits || [];
	const returnCode = req.headers.returncode ? (JSON.parse(req.headers.returncode) === true) : false;
	const inputConcepts = Array.isArray(req.body.inputConcepts) ? req.body.inputConcepts : [req.body.inputConcepts];
	const inputUnits = Array.isArray(req.body.inputUnits) ? req.body.inputUnits : [req.body.inputUnits];
	let inputVars = Array.isArray(req.body.inputVars) ? req.body.inputVars : [req.body.inputVars];
	inputVars = inputVars.map((inputVar) => {
		try {
			return JSON.parse(inputVar);
		} catch {
			return inputVar;
		}
	});
	const outputConcepts = Array.isArray(req.body.outputConcepts) ? req.body.outputConcepts : [req.body.outputConcepts];
	const outputUnits = Array.isArray(req.body.outputUnits) ? req.body.outputUnits : [req.body.outputUnits];

	for (const [i, element] of inputConcepts.entries()) {
		if (inputUnits[i] === null || inputUnits[i] === undefined || inputUnits[i] === "-" || inputUnits[i] === "") {
			inputUnits[i] = element;
		}
	}

	for (const [i, element] of outputConcepts.entries()) {
		if (outputUnits[i] === null || outputUnits[i] === undefined || outputUnits[i] === "-" || outputUnits[i] === "") {
			outputUnits[i] = element;
		}
	}

	if (
		outputConcepts === null
		|| outputConcepts === undefined
		|| outputConcepts.length === 0
		|| outputConcepts.length !== outputUnits.length
	) {
		return res.status(400).send("A function must have at least one output and every output must have its unit.");
	}

	if (inputConcepts.length !== inputUnits.length) {
		return res.status(400).send("Input parameters must have the same length.");
	}

	return request.post(`${process.env.RENDER_EXTERNAL_URL || `${req.protocol}://${req.get("host")}`}/gbm/search`, {
		form: { inputConcepts, outputConcepts },
	}, (err, response, body) => {
		if (err) console.error(err);
		if (response.statusCode !== 200) return res.status(response.statusCode).send(body);
		return Functionn.find({
			codeFile: { $in: JSON.parse(body).map((item) => item.function) },
			argsUnits: inputUnits,
			returnsUnits: outputUnits,
		}).populate("returns").exec((err2, funcs) => {
			if (err2) console.error(err2);
			if (funcs.length > 0) {
				const [func] = funcs; // Only possibility
				if (returnCode) {
					const codeRes = {
						function: func.codeFile,
						description: func.desc,
					};
					return res.json(codeRes);
				}

				const funcToRun = require(`../../library/${func.codeFile}`);
				const funcResult = funcToRun(...inputVars);
				return res.send(JSON.stringify(funcResult));
			}

			return Functionn.find({ codeFile: { $in: JSON.parse(body).map((item) => item.function) } }).populate("returns").exec((err3, funcs2) => {
				if (err3) {
					console.log(err3);
				}

				Relation.findOne({ name: "unitConversion" }, (err4, relation) => {
					if (err4) console.error(err4);
					let funcsChecked = 0;
					for (const func of funcs2) {
						funcsChecked += 1;
						const correctInputs = [];
						if (inputUnits.length > 0) {
							for (const [i, element] of inputUnits.entries()) {
								if (func.argsUnits[i] === element) {
									correctInputs[i] = inputVars[i];
								} else {
									let foundInputRelation = false;
									try {
										const inMath = math.unit(element);
										const argMath = math.unit(func.argsUnits[i]);
										correctInputs[i] = inputVars[i] * math.to(argMath, inMath).toNumber();
										foundInputRelation = true;
									} catch {
										for (const connection of relation.connects) {
											if (connection.start.name === element && connection.end.name === func.argsUnits[i]) {
												foundInputRelation = true;
												let { mathRelation } = connection;
												mathRelation = mathRelation.replace("start", JSON.stringify(inputVars[i]));
												correctInputs[i] = math.eval(mathRelation);
												break;
											}
										}
									}

									if (!foundInputRelation) {
										return res.status(418).send("There is a function whith these concepts, but given units can’t be interpreted.");
									}
								}
							}
						}

						const funcToRun = require(`../../library/${func.codeFile}`);
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
						} catch {
							for (const connection of relation.connects) {
								if (connection.start.name === outputUnits[0] && connection.end.name === func.returnsUnits[0]) {
									foundOutputRelation = true;
									let { mathRelation } = connection;
									mathRelation = mathRelation.replace("start", JSON.stringify(funcResult));
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
							return res.status(418).send("There is a function whith these concepts, but given units can’t be interpreted.");
						}

						if (funcsChecked === funcs.length) {
							return res.status(418).send("Functionn not found in DB.");
						}
					}

					return res.status(418).send("Functionn not found in DB.");
				});
			});
		});
	});
});

export default router;
