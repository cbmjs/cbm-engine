# Call By Meaning Functionality

## Basic Information

You can ask the server to run a function for you or give you the description and source code of a function by providing the desired inputs and outputs. To do that you must send a POST request to `cbm/call` with an object that contains the desired parameters in the body of the request. Note that in order to get a correct result, the relevant function in the database doesn't necessarily have to have exactly the same parameters. For example if it returns `time` in `seconds` and you ask for `clock` in `hours` it will automaticly do the conversion before sending you the result. The result will be in the expected format. If the requested function does not exist or a unit conversion can't be made, the server will send an appropriate message and a *status code* `418`. What the server knows for each function is documented [here](./MODELS.md).

## `params` Object

The full format of the object that should be included in the request is below:

``` javascript
{
  'inputConcepts': ['concept1', 'concept2'[, ...]],
  'inputUnits': ['unit1', 'unit2'[, ...]],
  'inputVars': [var1, var2[, ...]],
  'outputConcepts': ['concept1', 'concept2'[, ...]],
  'outputUnits': ['unit1', 'unit2'[, ...]]
}
```

If any of the above isn't applicable, for example if you ask for a function with no inputs, it can be omitted.

>Note that this *must*  be in the `body` of the request.

## Example

``` javascript
const request = require('request');
const uri = 'https://call-by-meaning.herokuapp.com/cbm/call';
let bday = new Date(1993, 2, 24);
let params = {
  'inputConcepts': 'date',
  'inputUnits': 'date',
  'inputVars': bday,
  'outputConcepts': 'star_sign',
  'outputUnits': 'word'
};
let req = request.post(uri, {form: params}, function (err, response, body) {
  console.log('I was born on 23rd of March and that makes me an %s!', body);
});
// yes, Date() in javascript is weird.
```