'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = composeInvoke;

var _assertFunctions = require('./assertFunctions');

var _assertFunctions2 = _interopRequireDefault(_assertFunctions);

var _defaultInvokeOptions = require('./defaultInvokeOptions');

var _defaultInvokeOptions2 = _interopRequireDefault(_defaultInvokeOptions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PROMISE_EXPECTATION_MESSAGE = "Warning: invoke function passed to composeInvoke should always return a Promise, but your invoke function returned something that was not then'able. This usually happens when you either forget to return the promise or if you are throwing an Error instead of returning Promise.reject().";

function composeInvoke(parse, usage, invokeFn) {
  (0, _assertFunctions2.default)({ parse: parse, usage: usage, invokeFn: invokeFn });
  return function (argv, notify) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var commandPrefix = options.commandPrefix,
        maxWidth = options.maxWidth;

    var subcliOpts = { commandPrefix: commandPrefix, maxWidth: maxWidth };
    var opts = Object.assign({}, _defaultInvokeOptions2.default, options);
    var formatMessage = opts.formatMessage,
        formatError = opts.formatError,
        formatUsage = opts.formatUsage;

    var args = void 0;
    try {
      (0, _assertFunctions2.default)({ notify: notify, formatMessage: formatMessage, formatError: formatError, formatUsage: formatUsage });
      args = parse(argv, subcliOpts);
    } catch (err) {
      notify(formatError(err.message || err));
      return Promise.resolve();
    }
    var usageText = usage(args, subcliOpts);
    if (usageText) {
      notify(formatUsage(usageText));
      return Promise.resolve();
    }

    try {
      var promise = invokeFn(args, notify, opts);
      if (typeof promise.then !== 'function') {
        console.error(PROMISE_EXPECTATION_MESSAGE);
      }
      return promise.catch(function (err) {
        notify(formatError(err.message || err));
      });
    } catch (err) {
      console.log(PROMISE_EXPECTATION_MESSAGE);
    }
  };
}
module.exports = exports['default'];