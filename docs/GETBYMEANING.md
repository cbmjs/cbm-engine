# Get By Meaning Functionality

## Basic Information

You can ask the server to give you the description and location of the source code of a function by providing the desired inputs and outputs. To do that you must send a POST request to `gbm/search` with an object that contains the desired parameters in the body of the request. The result will be an array of functions in JSON format. If the requested function does not exist, the server will send an appropriate message and a *status code* `418`. What the server knows for each function is documented [here](./MODELS.md). If an existing function has similar concepts in its definition, the server will return that one, instead of a `418` message.

## `params` Object

The full format of the object that should be included in the request is below:

``` javascript
{
  'inputConcepts': ['concept1', 'concept2'[, ...]],
  'outputConcepts': ['concept1', 'concept2'[, ...]]
}
```

If any of the above isn't applicable, for example if you ask for a function with no inputs, it can be omitted.

> Note that this *must* be in the `body` of the request.

## Example

``` javascript
const request = require('request');
const uri = 'https://call-by-meaning.onrender.com/gbm/search';
let params = {
  'inputConcepts': 'date',
  'outputConcepts': 'time'
};
let req = request.post(uri, {form: params}, function (err, response) {
  // Insert code here...
});
```
