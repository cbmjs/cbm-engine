# Get By Name Functionality

## Basic Information

You can ask the server to give you every information it has for a given concept, function or relation. A RESTful API is used, so to do that you simply send a GET request to `/gbn/{type}/{name}/`. The result will be in JSON format. If the requested object does not exist the server will send an appropriate message and a *status code* `418`. What is returned for each type is documented [here](./MODELS.md). If you search for a node that isn't present in the server, but a similar one is, the server will return that, instead of a `418` message.

## Example

``` http
https://call-by-meaning.com/gbn/c/time -> returns info about the concept "time"

https://call-by-meaning.com/gbn/c/clock -> returns info about the (similar existing) concept "time"

https://call-by-meaning.com/gbn/f/getTime -> returns info about the function "getTime"

https://call-by-meaning.com/gbn/r/unitConversion -> returns info about the relation "unitConversion"
```