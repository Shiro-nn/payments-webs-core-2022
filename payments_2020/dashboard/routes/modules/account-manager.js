
const crypto = require('crypto');


var generateSalt = function()
{
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
}

var sha256 = function(str) {
	return crypto.createHash('sha256').update(str).digest('hex');
}

var saltAndHash = function(pass, callback)
{
	var salt = generateSalt();
	callback(salt + sha256(pass + salt));
}

var validatePassword = function(plainPass, hashedPass, callback)
{
	var salt = hashedPass.substr(0, 10);
	var validHash = salt + sha256(plainPass + salt);
	callback(null, hashedPass === validHash);
}

var getObjectId = function(id)
{
	return new require('mongodb').ObjectID(id);
}

var listIndexes = function()
{
	accounts.indexes(null, function(e, indexes){
		for (var i = 0; i < indexes.length; i++) console.log('index:', i, indexes[i]);
	});
}

