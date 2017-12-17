const shell = require('shelljs');

const Node = require('../models/node');
const Function = require('../models/function');
const Relation = require('../models/relation');

async function createFuncJSON() {
  shell.exec('rm -f ./app/dev/funcs.json');
  if (shell.exec('jsdoc ./library -X >> ./app/dev/funcs.json').code !== 0) {
    shell.echo('Error: Could not create .json');
    shell.exit(1);
  } else {
    shell.echo('Success: funcs.json created.');
  }
}

function getFunctions() {
  // eslint-disable-next-line global-require
  const allFuncs = require('./funcs.json'); // even those not exported
  const temp = [];
  allFuncs.forEach((func) => {
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
    func.params.forEach((param) => {
      tempName.push(param.name);
      tempUnit.push(param.type.names[0]);
    });
  }
  return { names: tempName, units: tempUnit };
}

function getReturns(func) {
  const tempName = [];
  const tempUnit = [];
  if (func.returns && func.returns.length !== 0) {
    func.returns.forEach((returns) => {
      tempName.push(func.author[0]);
      tempUnit.push(returns.type.names[0]);
    });
  }
  return { names: tempName, units: tempUnit };
}

function getFuncProperties(funcs) {
  const temp = [];
  funcs.forEach((func) => {
    temp.push({
      name: func.longname.slice(2),
      desc: replaceAll(func.description, '\n', ' '),
      codeFile: `./js/'${func.meta.filename}`,
      argsNames: getArgs(func).names,
      argsUnits: getArgs(func).units,
      returnsNames: getReturns(func).names,
      returnsUnits: getReturns(func).units,
    });
  });
  return temp;
}

async function addFuncsToDB(funcProperties) {
  for (const func of funcProperties) {
    try {
      await Function.create({
        name: func.name,
        desc: func.desc,
        codeFile: func.codeFile,
        argsNames: func.argsNames,
        argsUnits: func.argsUnits,
        returnsNames: func.returnsNames,
        returnsUnits: func.returnsUnits,
      });
    } catch (error) {
      console.error(error);
    }
  }
}

function getParams(funcs) {
  const temp = [];
  funcs.forEach((func) => {
    if (func.params && func.params.length !== 0) {
      func.params.forEach((param) => {
        temp.push({
          name: param.name,
          desc: param.description,
        });
      });
    }
    if (func.returns && func.returns.length !== 0) {
      func.returns.forEach((returns) => {
        temp.push({
          name: func.author[0] || 'return value',
          desc: returns.description,
        });
      });
    }
  });
  const names = new Set();
  temp.forEach(param => names.add(param.name));
  const temp2 = temp.filter((param) => {
    if (names.has(param.name)) {
      names.delete(param.name);
      return true;
    }
    return false;
  });
  return temp2;
}

async function addNodesToDB(params) {
  for (const param of params) {
    try {
      await Node.create({
        name: param.name,
        desc: param.desc,
      });
    } catch (error) {
      console.error(error);
    }
  }
}

async function createRelations() {
  Relation.create({
    name: 'requiredBy',
    desc: 'First node is required to define/give meaning to second node.',
  });
  Relation.create({
    name: 'representsA',
    desc: 'First node is a different representation of second node',
  });
  Relation.create({
    name: 'unitConversion',
    desc: 'The two nodes are differents unit of measurement of the same thing.',
  });
}

async function fixReferences() {
  // fixNodeInFunc first
  try {
    const nodes = await Node.find({});
    const funcs = await Function.find({});
    for (const func of funcs) {
      for (const node of nodes) {
        if (func.argsNames.length > func.args.length && func.argsNames.indexOf(node.name) > -1) func.args.push(node._id);
        if (func.returnsNames.length > func.returns.length && func.returnsNames.indexOf(node.name) > -1) func.returns.push(node._id);
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
  // fixFuncInNode
  try {
    const nodes = await Node.find({});
    const funcs = await Function.find({});
    for (const node of nodes) {
      for (const func of funcs) {
        for (let i = 0; i < func.argsNames.length; i += 1) {
          if (func.argsNames[i] === node.name) {
            node.func_arg.push({ id: func._id, name: func.name, unitType: func.argsUnits[i] });
            node.units.push(func.argsUnits[i]);
          }
        }
        for (let i = 0; i < func.returnsNames.length; i += 1) {
          if (func.returnsNames[i] === node.name) {
            node.func_res.push({ id: func._id, name: func.name, unitType: func.returnsUnits[i] });
            node.units.push(func.returnsUnits[i]);
          }
        }
      }
      let tmp;
      let tmpKey = [];
      tmp = node.func_arg.filter((arg) => {
        const key = `${arg.name}|${arg.unitType}`;
        if (!tmpKey[key]) {
          tmpKey[key] = true;
          return true;
        }
        return false;
      }, Object.create(null));
      while (node.func_arg.length > 0) node.func_arg.pop();
      tmp.forEach(el => node.func_arg.push(el));
      tmpKey = [];
      tmp = node.func_res.filter((arg) => {
        const key = `${arg.name}|${arg.unitType}`;
        if (!tmpKey[key]) {
          tmpKey[key] = true;
          return true;
        }
        return false;
      }, Object.create(null));
      while (node.func_res.length > 0) node.func_res.pop();
      tmp.forEach(el => node.func_res.push(el));
      tmp = node.units.filter((el, pos, arr) => arr.indexOf(el) === pos);
      tmp.forEach((el) => {
        node.units.pull(el);
        node.units.push(el);
      });
      try {
        await node.save();
      } catch (error) {
        console.error(error);
      }
    }
  } catch (error) {
    console.error(error);
  }
  // fixRelations
  try {
    const nodes = await Node.find({});
    const relation = await Relation.findOne({ name: 'unitConversion' });
    for (const connection of relation.connects) {
      for (const node of nodes) {
        if (connection.start.name.indexOf(node.name) > -1) connection.start.id = (node._id);
        if (connection.end.name.indexOf(node.name) > -1) connection.end.id = (node._id);
      }
    }
    const tmpKey = [];
    relation.connects = relation.connects.filter((conn) => {
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
    await Node.findOneAndRemove({ name: 'Napo' });
    await Node.findOneAndRemove({ name: 'Mary' });
    await Function.findOneAndRemove({ name: 'testFunc' });
    await Relation.findOneAndRemove({ name: 'testRel' });
  } catch (error) {
    console.error(error);
  }
}

async function fillWithFuncs() {
  const funcs = getFunctions();
  const funcProperties = getFuncProperties(funcs);
  const params = getParams(funcs);
  await createFuncJSON();
  await addFuncsToDB(funcProperties);
  await addNodesToDB(params);
  await createRelations();
  await fixReferences();
  console.log('DONE!');
}

module.exports =
{
  fillWithFuncs,
  fixReferences,
  fixTests,
};
