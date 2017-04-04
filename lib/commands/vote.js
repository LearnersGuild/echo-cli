'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.invoke = exports.commandDescriptor = exports.usage = exports.parse = undefined;

var _loadCommand2 = require('../util/loadCommand');

var _loadCommand3 = _interopRequireDefault(_loadCommand2);

var _errorReporter = require('../util/errorReporter');

var _errorReporter2 = _interopRequireDefault(_errorReporter);

var _graphQLFetcher = require('../util/graphQLFetcher');

var _graphQLFetcher2 = _interopRequireDefault(_graphQLFetcher);

var _getServiceBaseURL = require('../util/getServiceBaseURL');

var _getServiceBaseURL2 = _interopRequireDefault(_getServiceBaseURL);

var _composeInvoke = require('../util/composeInvoke');

var _composeInvoke2 = _interopRequireDefault(_composeInvoke);

var _userValidation = require('../util/userValidation');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _loadCommand = (0, _loadCommand3.default)('vote');

var parse = _loadCommand.parse,
    usage = _loadCommand.usage,
    commandDescriptor = _loadCommand.commandDescriptor;
exports.parse = parse;
exports.usage = usage;
exports.commandDescriptor = commandDescriptor;


function invokeVoteAPI(lgJWT, goalDescriptors) {
  var mutation = {
    query: '\nmutation($goalDescriptors: [String]!) {\n  voteForGoals(goalDescriptors: $goalDescriptors) {\n    id\n  }\n}\n    ',
    variables: { goalDescriptors: goalDescriptors }
  };
  return (0, _graphQLFetcher2.default)(lgJWT, (0, _getServiceBaseURL2.default)(_getServiceBaseURL.GAME))(mutation).then(function (data) {
    return data.voteForGoals;
  });
}

function voteForGoals(goalDescriptors, notify, options) {
  var lgJWT = options.lgJWT,
      lgUser = options.lgUser,
      formatMessage = options.formatMessage,
      formatError = options.formatError;

  if (!lgJWT || !(0, _userValidation.userIsPlayer)(lgUser) && !(0, _userValidation.userIsModerator)(lgUser)) {
    return Promise.reject('You are not a player or a moderator in the game.');
  }
  if (goalDescriptors.length === 1) {
    return Promise.reject('You must vote for exactly 2 goals.');
  }
  if (goalDescriptors.length > 2) {
    notify(formatMessage('Only 2 goals are allowed, so these were disqualified: ' + goalDescriptors.slice(2).join(', ')));
  }

  notify(formatMessage('Validating the goals you voted on: ' + goalDescriptors.join(', ')));
  return invokeVoteAPI(lgJWT, goalDescriptors).catch(function (err) {
    _errorReporter2.default.captureException(err);
    notify(formatError(err.message || err));
  });
}

var invoke = exports.invoke = (0, _composeInvoke2.default)(parse, usage, function (args, notify, options) {
  var formatMessage = options.formatMessage;

  if (args._.length > 0) {
    return voteForGoals(args._, notify, options);
  }

  notify(formatMessage('Loading current cycle voting results ...'));
  return Promise.resolve();
});