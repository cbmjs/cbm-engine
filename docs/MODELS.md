# Models used to describe each concept

## Node

Every `Node` document in the database contains the following parameters:

* `name` : String. Contains the name of the node. It is *unique* for every node.
* `desc` : String. Contains a short description of the node.
* `units`: Array. Contains supported units of measurement for the node. When a unit isn't applicable, by definition, the unit matches the name. (i.e. we measure `date` in `date`).
* `func_arg`: Array. Contains references to all the functions that have an input of this type.
* `func_res`: Array. Contains references to all the functions that have an output of this type.

## Function

Every `Function` document in the database contains the following parameters:

* `name` : String. Contains the name of the function. It is *unique* for every function.
* `desc` : String. Contains a short description of what the function does.
* `codeFile`: String. Contains the path to the source file.
* `args`, `argsNames`, `argsUnits`: Arrays. Contain references to all the input nodes, names of input nodes, units of input nodes used by the function, respectively.
* `returns`, `returnsNames`, `returnsUnits`: Arrays. Contain references to all the output nodes, names of output nodes, units of output nodes used by the function, respectively.

## Relation

Every `Relation` document in the database contains the following parameters:

* `name` : String. Contains the name of the relation. It is *unique* for every relation.
* `desc` : String. Contains a short description of the relation.
* `codeFile`: Array. Contains:
  * `start`: Reference. Contains the starting node of the relation.
  * `end`: Reference. Contains the ending node of the relation.
  * `mathRelation`: String. Contains the math relation that connects the two nodes, if applicable. (e.g. 'end = sqrt(start)' )

## Note

You can view every available object by sending a GET request to `~/all/{nodes|functions|relations}` or `~/all/{nodes|functions|relations}/{names|desriptions}`