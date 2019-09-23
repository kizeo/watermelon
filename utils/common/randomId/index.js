"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.setGenerator = void 0;

var _rambdax = require("rambdax");

// Only numers and letters for human friendliness
var alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
var idLength = 16;

var randomCharacter = function () {
  var random = Math.floor(Math.random() * alphabet.length);
  return alphabet[random];
}; // Note: for explanation of generating record IDs on the client side, see:
// https://github.com/Nozbe/WatermelonDB/issues/5#issuecomment-442046292


var randomId = function () {
  return (0, _rambdax.join)('', (0, _rambdax.times)(randomCharacter, idLength));
};

var generator = function () {
  return randomId();
};

var setGenerator = function (newGenerator) {
  if ('string' !== typeof newGenerator()) {
    throw new Error('RandomId generator function needs to return a string type.');
  }

  generator = newGenerator;
};

exports.setGenerator = setGenerator;

var _default = function () {
  return generator();
};

exports.default = _default;