"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchChildren = fetchChildren;
exports.createTimestampsFor = exports.hasUpdatedAt = void 0;

var _fp = require("../utils/fp");

var Q = _interopRequireWildcard(require("../QueryDescription"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (null != obj) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var hasCreatedAt = (0, _fp.hasIn)('createdAt');
var hasUpdatedAt = (0, _fp.hasIn)('updatedAt');
exports.hasUpdatedAt = hasUpdatedAt;

var createTimestampsFor = function (model) {
  var date = Date.now();
  var timestamps = {};

  if (hasCreatedAt(model)) {
    timestamps.created_at = date;
  }

  if (hasUpdatedAt(model)) {
    timestamps.updated_at = date;
  }

  return timestamps;
};

exports.createTimestampsFor = createTimestampsFor;

function getChildrenQueries(model) {
  var associationsList = Object.entries(model.constructor.associations);
  var hasManyAssociations = associationsList.filter(function ([, value]) {
    return 'has_many' === value.type;
  });
  var childrenQueries = hasManyAssociations.map(function ([key, value]) {
    var childCollection = model.collections.get(key);
    return childCollection.query(Q.where(value.foreignKey, model.id));
  });
  return childrenQueries;
}

function fetchChildren() {
  return _fetchChildren.apply(this, arguments);
}

function _fetchChildren() {
  _fetchChildren = _asyncToGenerator(function* (model) {
    var childPromise =
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(function* (query) {
        var children = yield query.fetch();
        var grandchildren = yield (0, _fp.allPromises)(fetchChildren, children);
        return (0, _fp.unnest)(grandchildren).concat(children);
      });

      return function () {
        return _ref.apply(this, arguments);
      };
    }();

    var childrenQueries = getChildrenQueries(model);
    var results = yield (0, _fp.allPromises)(childPromise, childrenQueries);
    return (0, _fp.unnest)(results);
  });
  return _fetchChildren.apply(this, arguments);
}