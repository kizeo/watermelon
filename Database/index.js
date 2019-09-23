"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _merge = require("rxjs/observable/merge");

var _operators = require("rxjs/operators");

var _rambdax = require("rambdax");

var _common = require("../utils/common");

var _CollectionMap = _interopRequireDefault(require("./CollectionMap"));

var _ActionQueue = _interopRequireDefault(require("./ActionQueue"));

var _helpers = require("./helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || "[object Arguments]" === Object.prototype.toString.call(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

var Database =
/*#__PURE__*/
function () {
  function Database({
    adapter: adapter,
    modelClasses: modelClasses,
    actionsEnabled: actionsEnabled
  }) {
    _classCallCheck(this, Database);

    this._actionQueue = new _ActionQueue.default();
    Object.defineProperty(this, _actionsEnabled, {
      writable: true,
      value: void 0
    });
    this._resetCount = 0;
    this.adapter = adapter;
    this.schema = adapter.schema;
    this.collections = new _CollectionMap.default(this, modelClasses);
    (0, _common.invariant)(true === actionsEnabled || false === actionsEnabled, 'You must pass `actionsEnabled:` key to Database constructor. It is highly recommended you pass `actionsEnabled: true` (see documentation for more details), but can pass `actionsEnabled: false` for backwards compatibility.');
    _classPrivateFieldLooseBase(this, _actionsEnabled)[_actionsEnabled] = actionsEnabled;
  } // Executes multiple prepared operations
  // (made with `collection.prepareCreate` and `record.prepareUpdate`)
  // Note: falsy values (null, undefined, false) passed to batch are just ignored


  _createClass(Database, [{
    key: "batch",
    value: function () {
      var _batch = _asyncToGenerator(function* (...records) {
        this._ensureInAction("Database.batch() can only be called from inside of an Action. See docs for more details.");

        var operations = records.reduce(function (ops, record) {
          if (!record) {
            return ops;
          }

          (0, _common.invariant)(!record._isCommitted || record._hasPendingUpdate || record._hasPendingDelete, "Cannot batch a record that doesn't have a prepared create or prepared update"); // Deletes take presedence over updates

          if (false !== record._hasPendingDelete) {
            return 'destroy' === record._hasPendingDelete ? ops.concat([['destroyPermanently', record]]) : ops.concat([['markAsDeleted', record]]);
          } else if (record._hasPendingUpdate) {
            record._hasPendingUpdate = false; // TODO: What if this fails?

            return ops.concat([['update', record]]);
          }

          return ops.concat([['create', record]]);
        }, []);
        yield this.adapter.batch(operations);
        var sortedOperations = [];
        operations.forEach(function ([type, record]) {
          var operation = {
            record: record,
            type: (0, _helpers.operationTypeToCollectionChangeType)(type)
          };
          var indexOfCollection = sortedOperations.findIndex(function ({
            collection: collection
          }) {
            return collection === record.collection;
          });

          if (-1 !== indexOfCollection) {
            sortedOperations[indexOfCollection].operations.push(operation);
          } else {
            var {
              collection: collection
            } = record;
            sortedOperations.push({
              collection: collection,
              operations: [operation]
            });
          }
        });
        sortedOperations.forEach(function ({
          collection: collection,
          operations: operationz
        }) {
          collection.changeSet(operationz);
        });
      });

      return function batch() {
        return _batch.apply(this, arguments);
      };
    }() // Enqueues an Action -- a block of code that, when its ran, has a guarantee that no other Action
    // is running at the same time.
    // If Database is instantiated with actions enabled, all write actions (create, update, delete)
    // must be performed inside Actions, so Actions guarantee a write lock.
    //
    // See docs for more details and practical guide

  }, {
    key: "action",
    value: function action(work, description) {
      return this._actionQueue.enqueue(work, description);
    } // Emits a signal immediately, and on change in any of the passed tables

  }, {
    key: "withChangesForTables",
    value: function withChangesForTables(tables) {
      var _this = this;

      var changesSignals = tables.map(function (table) {
        return _this.collections.get(table).changes;
      });
      return _merge.merge.apply(void 0, _toConsumableArray(changesSignals)).pipe((0, _operators.startWith)(null));
    }
  }, {
    key: "unsafeResetDatabase",
    // Resets database - permanently destroys ALL records stored in the database, and sets up empty database
    //
    // NOTE: This is not 100% safe automatically and you must take some precautions to avoid bugs:
    // - You must NOT hold onto any Database objects. DO NOT store or cache any records, collections, anything
    // - You must NOT observe any record or collection or query
    // - You SHOULD NOT have any pending (queued) Actions. Pending actions will be aborted (will reject with an error).
    //
    // It's best to reset your app to an empty / logged out state before doing this.
    //
    // Yes, this sucks and there should be some safety mechanisms or warnings. Please contribute!
    value: function () {
      var _unsafeResetDatabase = _asyncToGenerator(function* () {
        this._ensureInAction("Database.unsafeResetDatabase() can only be called from inside of an Action. See docs for more details.");

        this._actionQueue._abortPendingActions();

        this._unsafeClearCaches();

        yield this.adapter.unsafeResetDatabase();
        this._resetCount += 1;
      });

      return function unsafeResetDatabase() {
        return _unsafeResetDatabase.apply(this, arguments);
      };
    }()
  }, {
    key: "_unsafeClearCaches",
    value: function _unsafeClearCaches() {
      (0, _rambdax.values)(this.collections.map).forEach(function (collection) {
        collection.unsafeClearCache();
      });
    }
  }, {
    key: "_ensureInAction",
    value: function _ensureInAction(error) {
      _classPrivateFieldLooseBase(this, _actionsEnabled)[_actionsEnabled] && (0, _common.invariant)(this._actionQueue.isRunning, error);
    }
  }, {
    key: "_ensureActionsEnabled",
    value: function _ensureActionsEnabled() {
      (0, _common.invariant)(_classPrivateFieldLooseBase(this, _actionsEnabled)[_actionsEnabled], '[Sync] To use Sync, Actions must be enabled. Pass `{ actionsEnabled: true }` to Database constructor — see docs for more details');
    }
  }]);

  return Database;
}();

exports.default = Database;

var _actionsEnabled = _classPrivateFieldLooseKey("actionsEnabled");