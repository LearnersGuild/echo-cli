'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.invoke = exports.commandDescriptor = exports.usage = exports.parse = undefined;

var _loadCommand2 = require('../util/loadCommand');

var _loadCommand3 = _interopRequireDefault(_loadCommand2);

var _composeInvoke = require('../util/composeInvoke');

var _composeInvoke2 = _interopRequireDefault(_composeInvoke);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _loadCommand = (0, _loadCommand3.default)('retro');

var parse = _loadCommand.parse,
    usage = _loadCommand.usage,
    commandDescriptor = _loadCommand.commandDescriptor;
exports.parse = parse;
exports.usage = usage;
exports.commandDescriptor = commandDescriptor;
var invoke = exports.invoke = (0, _composeInvoke2.default)(parse, usage, function (args, notify, options) {
  var formatMessage = options.formatMessage;

  if (args._.length > 1) {
    return Promise.reject('Invalid arguments. Try --help for usage.');
  }

  var projectName = args._.length === 1 ? args._[0].replace('#', '') : null;
  var loadingMessage = projectName ? 'Looking for retrospective survey for #' + projectName + ' ...' : 'Looking for retrospective survey ...';
  notify(formatMessage(loadingMessage));
  return Promise.resolve();
});