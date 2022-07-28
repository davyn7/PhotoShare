"use strict";
const crypto = require('crypto');

function makePasswordEntry(clearTextPassword) {
  var obj = {};
  var salt = crypto.randomBytes(8);
  salt = salt.toString('hex');
  var app = clearTextPassword + salt;
  const hash1 = crypto.createHash('sha1');
  hash1.update(app);
  const hash = hash1.digest("hex");
  obj['hash'] = hash;
  obj['salt'] = salt;
  return obj;
}

function doesPasswordMatch(hash, salt, clearTextPassword) {
  var app = clearTextPassword + salt;
  const hash1 = crypto.createHash('sha1');
  hash1.update(app);
  const curr = hash1.digest("hex");
  if(hash1 === curr) return true;
  else return false;
}

module.exports = {makePasswordEntry, doesPasswordMatch};
