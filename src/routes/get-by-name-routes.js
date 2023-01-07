import express from "express";
import WordPOS from "wordpos";

import Concept from "../models/concept.js";
import Functionn from "../models/function.js";
import Relation from "../models/relation.js";

const router = new express.Router();
const wordpos = new WordPOS();

router.all("/", (req, res) => {
	res.send("Hello. This is the path to search by name. Detailed information can be found"
  + " <a href=https://github.com/cbmjs/cbm-engine/>here</a>.<br> Check <a href=./gbn/c>/c/</a><br>"
  + "Check <a href=./gbn/f>/f/</a><br>Check <a href=./gbn/r>/r/</a>");
});

router.get("/c", (req, res) => {
	res.send("This is the path to search for concepts e.g \"time\"");
});

router.get("/c/:concept", (req, res) => {
	const name = req.params.concept;
	Concept.findOne({ name }, (err1, concept1) => {
		if (err1) console.error(err1);
		if (concept1) return res.json(concept1);
		return wordpos.lookup(name.replace("_", " "), (result) => {
			let checked = 0;
			if (result[0] === null || result[0] === undefined) return res.status(418).send("Concept not found in DB.");
			let allSynonyms = [];
			for (const res2 of result) allSynonyms = [...allSynonyms, ...res2.synonyms];
			allSynonyms = [...new Set(allSynonyms)];
			const conceptcb = (err, concept3) => {
				checked += 1;
				if (err) console.error(err);
				if (concept3) return res.json(concept3);
				if (checked === allSynonyms.length && !res.headersSent) return res.status(418).send("Concept not found in DB.");
				return null;
			};

			for (const concept2 of allSynonyms) {
				if (res.headersSent) break;
				Concept.findOne({ name: concept2.replaceAll(/[^\s\w]/g, "") }, conceptcb);
			}

			return null;
		});
	});
});

router.get("/f", (req, res) => {
	res.send("This is the path to search for functions e.g \"getZodiac\"");
});

router.get("/f/:func", (req, res) => {
	Functionn.findOne({ name: req.params.func }).populate(["args", "returns"]).exec((err, func) => {
		if (err) {
			console.error(err);
		}

		if (func) {
			return res.json(func);
		}

		return res.status(418).send("Functionn not found in DB");
	});
});

router.get("/r", (req, res) => {
	res.send("This is the path to search for relations e.g \"requiredBy\"");
});

router.get("/r/:rel", (req, res) => {
	Relation.findOne({ name: req.params.rel }, (err, rel) => {
		if (err) {
			console.error(err);
		}

		if (rel) {
			return res.json(rel);
		}

		return res.status(418).send("Relation not found in DB");
	});
});

export default router;
