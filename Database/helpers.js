"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.operationTypeToCollectionChangeType = void 0;

var _common = require("../Collection/common");

var operationTypeToCollectionChangeType = function (input) {
  switch (input) {
    case 'create':
      return _common.CollectionChangeTypes.created;

    case 'update':
      return _common.CollectionChangeTypes.updated;

    case 'markAsDeleted':
    case 'destroyPermanently':
      return _common.CollectionChangeTypes.destroyed;

    default:
      throw new Error("".concat(input, " is invalid operation type"));
  }
};

exports.operationTypeToCollectionChangeType = operationTypeToCollectionChangeType;