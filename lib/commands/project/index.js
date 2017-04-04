'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.invoke = exports.commandDescriptor = exports.usage = exports.parse = undefined;

var _loadCommand2 = require('../../util/loadCommand');

var _loadCommand3 = _interopRequireDefault(_loadCommand2);

var _composeInvoke = require('../../util/composeInvoke');

var _composeInvoke2 = _interopRequireDefault(_composeInvoke);

var _setArtifact = require('./setArtifact');

var _list = require('./list');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _loadCommand = (0, _loadCommand3.default)('project');

var parse = _loadCommand.parse,
    usage = _loadCommand.usage,
    commandDescriptor = _loadCommand.commandDescriptor;
exports.parse = parse;
exports.usage = usage;
exports.commandDescriptor = commandDescriptor;
var invoke = exports.invoke = (0, _composeInvoke2.default)(parse, usage, function (args, notify, options) {
  if (args._.length >= 1) {
    var subcommandFuncs = {
      'set-artifact': function setArtifact() {
        return (0, _setArtifact.setProjectArtifactURL)(args.$['set-artifact'], notify, options);
      },
      'list': function list() {
        return (0, _list.listProjects)(args.$.list, notify, options);
      }
    };
    return subcommandFuncs[args._[0]]();
  }

  return Promise.reject('Invalid arguments. Try --help for usage.');
});