"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lazy = _interopRequireDefault(require("../decorators/lazy"));

var _invariant = _interopRequireDefault(require("../utils/common/invariant"));

var _publishReplayLatestWhileConnected = _interopRequireDefault(require("../utils/rx/publishReplayLatestWhileConnected"));

var _helpers = require("./helpers");

var _class, _descriptor, _temp, _model, _columnName, _relationTableName, _isImmutable;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && void 0 !== desc.initializer) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (void 0 === desc.initializer) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

function _initializerWarningHelper() { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and set to use loose mode. ' + 'To use proposal-class-properties in spec mode with decorators, wait for ' + 'the next major version of decorators in stage 2.'); }

// Defines a one-to-one relation between two Models (two tables in db)
// Do not create this object directly! Use `relation` or `immutableRelation` decorators instead
var Relation = (_class = (_temp =
/*#__PURE__*/
function () {
  _createClass(Relation, [{
    key: "_model",
    get: function get() {
      return _classPrivateFieldLooseBase(this, _model)[_model];
    }
  }, {
    key: "_columnName",
    get: function get() {
      return _classPrivateFieldLooseBase(this, _columnName)[_columnName];
    }
  }, {
    key: "_relationTableName",
    get: function get() {
      return _classPrivateFieldLooseBase(this, _relationTableName)[_relationTableName];
    }
  }, {
    key: "_isImmutable",
    get: function get() {
      return _classPrivateFieldLooseBase(this, _isImmutable)[_isImmutable];
    }
  }]);

  function Relation(model, relationTableName, columnName, options) {
    _classCallCheck(this, Relation);

    Object.defineProperty(this, _model, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _columnName, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _relationTableName, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _isImmutable, {
      writable: true,
      value: void 0
    });

    _initializerDefineProperty(this, "_cachedObservable", _descriptor, this);

    _classPrivateFieldLooseBase(this, _model)[_model] = model;
    _classPrivateFieldLooseBase(this, _relationTableName)[_relationTableName] = relationTableName;
    _classPrivateFieldLooseBase(this, _columnName)[_columnName] = columnName;
    _classPrivateFieldLooseBase(this, _isImmutable)[_isImmutable] = options.isImmutable;
  }

  _createClass(Relation, [{
    key: "fetch",
    value: function fetch() {
      var {
        id: id
      } = this;

      if (id) {
        return _classPrivateFieldLooseBase(this, _model)[_model].collections.get(_classPrivateFieldLooseBase(this, _relationTableName)[_relationTableName]).find(id);
      }

      return Promise.resolve(null);
    }
  }, {
    key: "set",
    value: function set(record) {
      this.id = null === record || void 0 === record ? void 0 : record.id;
    }
  }, {
    key: "observe",
    value: function observe() {
      return this._cachedObservable;
    }
  }, {
    key: "id",
    get: function get() {
      return _classPrivateFieldLooseBase(this, _model)[_model]._getRaw(_classPrivateFieldLooseBase(this, _columnName)[_columnName]);
    },
    set: function set(newId) {
      if (_classPrivateFieldLooseBase(this, _isImmutable)[_isImmutable]) {
        (0, _invariant.default)(!_classPrivateFieldLooseBase(this, _model)[_model]._isCommitted, "Cannot change property marked as @immutableRelation ".concat(Object.getPrototypeOf(_classPrivateFieldLooseBase(this, _model)[_model]).constructor.name, " - ").concat(_classPrivateFieldLooseBase(this, _columnName)[_columnName]));
      }

      _classPrivateFieldLooseBase(this, _model)[_model]._setRaw(_classPrivateFieldLooseBase(this, _columnName)[_columnName], newId || null);
    }
  }]);

  return Relation;
}(), _model = _classPrivateFieldLooseKey("model"), _columnName = _classPrivateFieldLooseKey("columnName"), _relationTableName = _classPrivateFieldLooseKey("relationTableName"), _isImmutable = _classPrivateFieldLooseKey("isImmutable"), _temp), (_descriptor = _applyDecoratedDescriptor(_class.prototype, "_cachedObservable", [_lazy.default], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return (0, _helpers.createObservable)(this).pipe(_publishReplayLatestWhileConnected.default).refCount();
  }
})), _class);
exports.default = Relation;