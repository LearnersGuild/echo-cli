'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = assertFunctions;
function assertFunctions(funcMap) {
  Object.keys(funcMap).forEach(function (funcName) {
    var func = funcMap[funcName];
    var funcType = typeof func === 'undefined' ? 'undefined' : _typeof(func);
    if (funcType !== 'function') {
      throw new Error('Expected ' + funcName + ' to be of type \'function\', not \'' + funcType + '\'');
    }
  });
}
module.exports = exports['default'];