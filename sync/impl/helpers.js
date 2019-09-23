"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveConflict = resolveConflict;
exports.prepareCreateFromRaw = prepareCreateFromRaw;
exports.prepareUpdateFromRaw = prepareUpdateFromRaw;
exports.prepareMarkAsSynced = prepareMarkAsSynced;
exports.ensureActionsEnabled = ensureActionsEnabled;
exports.ensureSameDatabase = ensureSameDatabase;
exports.isChangeSetEmpty = void 0;

var _rambdax = require("rambdax");

var _common = require("../../utils/common");

var _RawRecord = require("../../RawRecord");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; var ownKeys = Object.keys(source); if ('function' === typeof Object.getOwnPropertySymbols) { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Returns raw record with naive solution to a conflict based on local `_changed` field
// This is a per-column resolution algorithm. All columns that were changed locally win
// and will be applied on top of the remote version.
function resolveConflict(local, remote) {
  // We SHOULD NOT have a reference to a `deleted` record, but since it was locally
  // deleted, there's nothing to update, since the local deletion will still be pushed to the server -- return raw as is
  if ('deleted' === local._status) {
    return local;
  } // mutating code - performance-critical path


  var resolved = _objectSpread({}, local, remote, {
    id: local.id,
    _status: local._status,
    _changed: local._changed // Use local properties where changed

  });

  local._changed.split(',').forEach(function (column) {
    resolved[column] = local[column];
  }); // Handle edge case


  if ('created' === local._status) {
    (0, _common.logError)("[Sync] Server wants client to update record ".concat(local.id, ", but it's marked as locally created. This is most likely either a server error or a Watermelon bug (please file an issue if it is!). Will assume it should have been 'synced', and just replace the raw"));
    resolved._status = 'synced';
  }

  return resolved;
}

function replaceRaw(record, dirtyRaw) {
  record._raw = (0, _RawRecord.sanitizedRaw)(dirtyRaw, record.collection.schema);
}

function prepareCreateFromRaw(collection, dirtyRaw) {
  return collection.prepareCreate(function (record) {
    replaceRaw(record, _objectSpread({}, dirtyRaw, {
      _status: 'synced',
      _changed: ''
    }));
  });
}

function prepareUpdateFromRaw(record, updatedDirtyRaw, log) {
  // Note COPY for log - only if needed
  var logConflict = log && !!record._raw._changed;
  var logLocal = logConflict ? _objectSpread({}, record._raw) : {};
  var logRemote = logConflict ? _objectSpread({}, updatedDirtyRaw) : {};
  var newRaw = resolveConflict(record._raw, updatedDirtyRaw);
  return record.prepareUpdate(function () {
    replaceRaw(record, newRaw); // log resolved conflict - if any

    if (logConflict && log) {
      log.resolvedConflicts = log.resolvedConflicts || [];
      log.resolvedConflicts.push({
        local: logLocal,
        remote: logRemote,
        resolved: _objectSpread({}, record._raw)
      });
    }
  });
}

function prepareMarkAsSynced(record) {
  var newRaw = _objectSpread({}, record._raw, {
    _status: 'synced',
    _changed: ''
  });

  return record.prepareUpdate(function () {
    replaceRaw(record, newRaw);
  });
}

function ensureActionsEnabled(database) {
  database._ensureActionsEnabled();
}

function ensureSameDatabase(database, initialResetCount) {
  (0, _common.invariant)(database._resetCount === initialResetCount, "[Sync] Sync aborted because database was reset");
}

var isChangeSetEmpty = (0, _rambdax.pipe)(_rambdax.values, (0, _rambdax.all)(function ({
  created: created,
  updated: updated,
  deleted: deleted
}) {
  return 0 === created.length + updated.length + deleted.length;
}));
exports.isChangeSetEmpty = isChangeSetEmpty;