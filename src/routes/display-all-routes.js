import express from "express";

import Concept from "../models/concept.js";
import Functionn from "../models/function.js";
import Relation from "../models/relation.js";

const router = new express.Router();

router.all("/", (req, res) => {
	res.send("Hello.<br> Check <a href=./all/concepts>concepts</a><br>Check <a href=./all/"
  + "functions>functions</a><br>Check <a href=./all/relations>relations</a>");
});

router.get("/concepts", (req, res) => {
	Concept.find({}, (err, concepts) => {
		if (err) {
			console.error(err);
		}

		if (concepts.length === 0) {
			return res.status(418).send("There aren’t any concepts.");
		}

		const temp = [];
		for (const concept of concepts) {
			temp.push({
				name: concept.name,
				description: concept.desc,
				units: concept.units,
			});
		}

		return res.json(temp);
	});
});

router.get("/concepts/names", (req, res) => {
	Concept.find({}, (err, concepts) => {
		if (err) {
			console.error(err);
		}

		if (concepts.length === 0) {
			return res.status(418).send("There aren’t any concepts.");
		}

		const temp = [];
		for (const concept of concepts) temp.push(concept.name);
		return res.json(temp);
	});
});

router.get("/functions", (req, res) => {
	Functionn.find({}, (err, funcs) => {
		if (err) {
			console.error(err);
		}

		if (funcs.length === 0) {
			return res.status(418).send("There aren’t any functions.");
		}

		const temp = [];
		for (const func of funcs) {
			temp.push({
				name: func.name,
				description: func.desc,
				source_code: func.codeFile,
			});
		}

		return res.json(temp);
	});
});

router.get("/functions/names", (req, res) => {
	Functionn.find({}, (err, funcs) => {
		if (err) {
			console.error(err);
		}

		if (funcs.length === 0) {
			return res.status(418).send("There aren’t any functions.");
		}

		const temp = [];
		for (const func of funcs) temp.push(func.name);
		return res.json(temp);
	});
});

router.get("/functions/descriptions", (req, res) => {
	Functionn.find({}, (err, funcs) => {
		if (err) {
			console.error(err);
		}

		if (funcs.length === 0) {
			return res.status(418).send("There aren’t any functions.");
		}

		const temp = [];
		for (const func of funcs) temp.push(func.desc);
		return res.json(temp);
	});
});

router.get("/relations", (req, res) => {
	Relation.find({}, (err, relations) => {
		if (err) {
			console.error(err);
		}

		if (relations.length === 0) {
			return res.status(418).send("There aren’t any relations.");
		}

		const temp = [];
		for (const relation of relations) {
			temp.push({
				name: relation.name,
				description: relation.desc,
			});
		}

		return res.json(temp);
	});
});

export default router;
