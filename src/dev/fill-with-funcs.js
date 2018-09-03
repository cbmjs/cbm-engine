/* eslint-disable no-await-in-loop */

const shell = require('shelljs');

const Concept = require('../models/concept');
const Functionn = require('../models/function');
const Relation = require('../models/relation');

function createFuncJSON() {
	shell.exec('rm -f ./app/dev/funcs.json');
	if (shell.exec('jsdoc ./library -X >> ./app/dev/funcs.json').code === 0) {
		shell.echo('Success: funcs.json created.');
	} else {
		shell.echo('Error: Could not create .json');
		shell.exit(1);
	}
}

function getFunctions() {
	const allFuncs = require('./funcs.json'); // Even those not exported
	const temp = [];
	allFuncs.forEach(func => {
		if (func.scope === 'static' && func.memberof === '_' && func.author) {
			temp.push(func);
		}
	});
	return temp;
}

function replaceAll(target, search, replacement) {
	return target.replace(new RegExp(search, 'g'), replacement);
}

function getArgs(func) {
	const tempName = [];
	const tempUnit = [];
	if (func.params && func.params.length !== 0) {
		func.params.forEach(param => {
			tempName.push(param.name);
			tempUnit.push(param.type.names[0]);
		});
	}
	return {names: tempName, units: tempUnit};
}

function getReturns(func) {
	const tempName = [];
	const tempUnit = [];
	if (func.returns && func.returns.length !== 0) {
		func.returns.forEach(returns => {
			tempName.push(func.author[0]);
			tempUnit.push(returns.type.names[0]);
		});
	}
	return {names: tempName, units: tempUnit};
}

function getFuncProperties(funcs) {
	const temp = [];
	funcs.forEach(func => {
		temp.push({
			name: func.longname.slice(2),
			desc: replaceAll(func.description, '\n', ' '),
			codeFile: `./js/'${func.meta.filename}`,
			argsNames: getArgs(func).names,
			argsUnits: getArgs(func).units,
			returnsNames: getReturns(func).names,
			returnsUnits: getReturns(func).units
		});
	});
	return temp;
}

async function addFuncsToDB(funcProperties) {
	for (const func of funcProperties) {
		try {
			await Functionn.create({
				name: func.name,
				desc: func.desc,
				codeFile: func.codeFile,
				argsNames: func.argsNames,
				argsUnits: func.argsUnits,
				returnsNames: func.returnsNames,
				returnsUnits: func.returnsUnits
			});
		} catch (error) {
			console.error(error);
		}
	}
}

function getParams(funcs) {
	const temp = [];
	funcs.forEach(func => {
		if (func.params && func.params.length !== 0) {
			func.params.forEach(param => {
				temp.push({
					name: param.name,
					desc: param.description
				});
			});
		}
		if (func.returns && func.returns.length !== 0) {
			func.returns.forEach(returns => {
				temp.push({
					name: func.author[0] || 'return value',
					desc: returns.description
				});
			});
		}
	});
	const names = new Set();
	temp.forEach(param => names.add(param.name));
	const temp2 = temp.filter(param => {
		if (names.has(param.name)) {
			names.delete(param.name);
			return true;
		}
		return false;
	});
	return temp2;
}

async function addConceptsToDB(params) {
	for (const param of params) {
		try {
			await Concept.create({
				name: param.name,
				desc: param.desc
			});
		} catch (error) {
			console.error(error);
		}
	}
}

function createRelations() {
	Relation.create({
		name: 'requiredBy',
		desc: 'First concept is required to define/give meaning to second concept.'
	});
	Relation.create({
		name: 'representsA',
		desc: 'First concept is a different representation of second concept'
	});
	Relation.create({
		name: 'unitConversion',
		desc: 'The two concepts are differents unit of measurement of the same thing.'
	});
}

async function fixReferences() {
	// FixConceptInFunc first
	try {
		const concepts = await Concept.find({});
		const funcs = await Functionn.find({});
		for (const func of funcs) {
			for (const concept of concepts) {
				if (func.argsNames.length > func.args.length && func.argsNames.indexOf(concept.name) > -1) {
					func.args.push(concept._id);
				}
				if (func.returnsNames.length > func.returns.length && func.returnsNames.indexOf(concept.name) > -1) {
					func.returns.push(concept._id);
				}
			}
			try {
				await func.save();
			} catch (error) {
				console.error(error);
			}
		}
	} catch (error) {
		console.error(error);
	}
	// FixFuncInConcept
	try {
		const concepts = await Concept.find({});
		const funcs = await Functionn.find({});
		for (const concept of concepts) {
			for (const func of funcs) {
				for (let i = 0; i < func.argsNames.length; i += 1) {
					if (func.argsNames[i] === concept.name) {
						concept.func_arg.push({id: func._id, name: func.name, unitType: func.argsUnits[i]});
						concept.units.push(func.argsUnits[i]);
					}
				}
				for (let i = 0; i < func.returnsNames.length; i += 1) {
					if (func.returnsNames[i] === concept.name) {
						concept.func_res.push({id: func._id, name: func.name, unitType: func.returnsUnits[i]});
						concept.units.push(func.returnsUnits[i]);
					}
				}
			}
			let tmp;
			let tmpKey = [];
			tmp = concept.func_arg.filter(arg => {
				const key = `${arg.name}|${arg.unitType}`;
				if (!tmpKey[key]) {
					tmpKey[key] = true;
					return true;
				}
				return false;
			}, Object.create(null));
			while (concept.func_arg.length > 0) {
				concept.func_arg.pop();
			}
			tmp.forEach(el => concept.func_arg.push(el));
			tmpKey = [];
			tmp = concept.func_res.filter(arg => {
				const key = `${arg.name}|${arg.unitType}`;
				if (!tmpKey[key]) {
					tmpKey[key] = true;
					return true;
				}
				return false;
			}, Object.create(null));
			while (concept.func_res.length > 0) {
				concept.func_res.pop();
			}
			tmp.forEach(el => concept.func_res.push(el));
			tmp = concept.units.filter((el, pos, arr) => arr.indexOf(el) === pos);
			tmp.forEach(el => {
				concept.units.pull(el);
				concept.units.push(el);
			});
			try {
				await concept.save();
			} catch (error) {
				console.error(error);
			}
		}
	} catch (error) {
		console.error(error);
	}
	// FixRelations
	try {
		const concepts = await Concept.find({});
		const relation = await Relation.findOne({name: 'unitConversion'});
		for (const connection of relation.connects) {
			for (const concept of concepts) {
				if (connection.start.name.indexOf(concept.name) > -1) {
					connection.start.id = (concept._id);
				}
				if (connection.end.name.indexOf(concept.name) > -1) {
					connection.end.id = (concept._id);
				}
			}
		}
		const tmpKey = [];
		relation.connects = relation.connects.filter(conn => {
			const key = `${conn.start}|${conn.end}|${conn.mathRelation}`;
			if (!tmpKey[key]) {
				tmpKey[key] = true;
				return true;
			}
			return false;
		}, Object.create(null));
		relation.markModified('connects');
		try {
			await relation.save();
		} catch (error) {
			console.error(error);
		}
	} catch (error) {
		console.error(error);
	}
}

async function fixTests() {
	try {
		await Concept.findOneAndRemove({name: 'Napo'});
		await Concept.findOneAndRemove({name: 'Mary'});
		await Functionn.findOneAndRemove({name: 'testFunc'});
		await Relation.findOneAndRemove({name: 'testRel'});
	} catch (error) {
		console.error(error);
	}
}

async function fillWithFuncs() {
	const funcs = getFunctions();
	const funcProperties = getFuncProperties(funcs);
	const params = getParams(funcs);
	createFuncJSON();
	await addFuncsToDB(funcProperties);
	await addConceptsToDB(params);
	createRelations();
	await fixReferences();
	console.log('DONE!');
}

module.exports =
{
	fillWithFuncs,
	fixReferences,
	fixTests
};
