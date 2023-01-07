# Models used to describe each concept

## Concept

Every `Concept` document in the database contains the following parameters:

* `name` : String. Contains the name of the concept. It is *unique* for every concept.
* `desc` : String. Contains a short description of the concept.
* `units`: Array. Contains supported units of measurement for the concept. When a unit isn't applicable, by definition, the unit matches the name. (i.e. we measure `date` in `date`).
* `func_arg`: Array. Contains references to all the functions that have an input of this type.
* `func_res`: Array. Contains references to all the functions that have an output of this type.

## Function

Every `Function` document in the database contains the following parameters:

* `name` : String. Contains the name of the function. It is *unique* for every function.
* `desc` : String. Contains a short description of what the function does.
* `codeFile`: String. Contains the path to the source file.
* `args`, `argsNames`, `argsUnits`: Arrays. Contain references to all the input concepts, names of input concepts, units of input concepts used by the function, respectively.
* `returns`, `returnsNames`, `returnsUnits`: Arrays. Contain references to all the output concepts, names of output concepts, units of output concepts used by the function, respectively.

## Relation

Every `Relation` document in the database contains the following parameters:

* `name` : String. Contains the name of the relation. It is *unique* for every relation.
* `desc` : String. Contains a short description of the relation.
* `connects`: Array. Contains:
  * `start`: Reference. Contains the starting concept of the relation.
  * `end`: Reference. Contains the ending concept of the relation.
  * `mathRelation`: String. Contains the math relation that connects the two concepts, if applicable. (e.g. 'end = sqrt(start)' )

## Note

You can view every available object by sending a GET request to `~/all/{concepts|functions|relations}` or `~/all/{concepts|functions|relations}/{names|desriptions}`
