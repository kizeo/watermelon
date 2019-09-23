"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.notLike = exports.like = exports.rawFieldEquals = void 0;

var _rambdax = require("rambdax");

var _fp = require("../../utils/fp");

var _likeToRegexp = _interopRequireDefault(require("../../utils/fp/likeToRegexp"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable eqeqeq */
var between = function (left, [lower, upper]) {
  return left >= lower && left <= upper;
};

var rawFieldEquals = function (left, right) {
  return left == right;
};

exports.rawFieldEquals = rawFieldEquals;

var noNullComparisons = function (operator) {
  return function (left, right) {
    // return false if any operand is null/undefined
    if (null == left || null == right) {
      return false;
    }

    return operator(left, right);
  };
}; // Same as `a > b`, but `5 > undefined` is also true


var weakGt = function (left, right) {
  return left > right || null != left && null == right;
};

var handleLikeValue = function (v, defaultV) {
  return 'string' === typeof v ? v : defaultV;
};

var like = function (left, right) {
  var leftV = handleLikeValue(left, '');
  return (0, _likeToRegexp.default)(right).test(leftV);
};

exports.like = like;

var notLike = function (left, right) {
  // Mimic SQLite behaviour
  if (null === left) {
    return false;
  }

  var leftV = handleLikeValue(left, '');
  return !(0, _likeToRegexp.default)(right).test(leftV);
};

exports.notLike = notLike;
var operators = {
  eq: rawFieldEquals,
  notEq: (0, _fp.complement)(rawFieldEquals),
  gt: noNullComparisons(_fp.gt),
  gte: noNullComparisons(_fp.gte),
  weakGt: weakGt,
  lt: noNullComparisons(_fp.lt),
  lte: noNullComparisons(_fp.lte),
  oneOf: _rambdax.includes,
  notIn: noNullComparisons((0, _fp.complement)(_rambdax.includes)),
  between: between,
  like: like,
  notLike: notLike
};
var _default = operators;
exports.default = _default;