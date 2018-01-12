const request = require('sync-request');

module.exports = (...args) => {
let uri = 'https://api.github.com/repos/user_name/repo_name';
const argsToreplace = ["user_name","repo_name"];
argsToreplace.forEach((el, index) => { uri = uri.replace(el, args[index]); });
const res = request('GET', uri);
return res.getBody('utf8');
};