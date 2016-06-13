'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.invoke = exports.commandDescriptor = exports.usage = exports.parse = undefined;

var _loadCommand2 = require('../../util/loadCommand');

var _loadCommand3 = _interopRequireDefault(_loadCommand2);

var _composeInvoke = require('../../util/composeInvoke');

var _composeInvoke2 = _interopRequireDefault(_composeInvoke);

var _LogRetroCommand = require('./LogRetroCommand');

var _LogRetroCommand2 = _interopRequireDefault(_LogRetroCommand);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _loadCommand = (0, _loadCommand3.default)('log');

var parse = _loadCommand.parse;
var usage = _loadCommand.usage;
var commandDescriptor = _loadCommand.commandDescriptor;
exports.parse = parse;
exports.usage = usage;
exports.commandDescriptor = commandDescriptor;
var invoke = exports.invoke = (0, _composeInvoke2.default)(parse, usage, function (args, notify, options) {
  var lgJWT = options.lgJWT;
  var lgPlayer = options.lgPlayer;
  var formatError = options.formatError;
  var formatMessage = options.formatMessage;

  if (!lgJWT || !lgPlayer || !lgPlayer.id) {
    return Promise.reject('You are not a player in the game.');
  }
  if (args.retro) {
    var retro = new _LogRetroCommand2.default(lgJWT, notify, formatMessage, formatError);

    if (typeof args.question === 'string' && args.question.match(/^\d+$/)) {
      var questionNumber = parseInt(args.question, 10);
      var responseParams = args._;
      if (responseParams.length === 0) {
        return retro.printSurveyQuestion(questionNumber);
      }
      return retro.logReflection(questionNumber, responseParams);
    }
    return retro.printSurvey();
  }
  return Promise.reject('Invalid arguments. Try --help for usage.');
});