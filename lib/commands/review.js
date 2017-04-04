'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.invoke = exports.commandDescriptor = exports.usage = exports.parse = undefined;

var _loadCommand2 = require('../util/loadCommand');

var _loadCommand3 = _interopRequireDefault(_loadCommand2);

var _composeInvoke = require('../util/composeInvoke');

var _composeInvoke2 = _interopRequireDefault(_composeInvoke);

var _getServiceBaseURL = require('../util/getServiceBaseURL');

var _getServiceBaseURL2 = _interopRequireDefault(_getServiceBaseURL);

var _errorReporter = require('../util/errorReporter');

var _errorReporter2 = _interopRequireDefault(_errorReporter);

var _graphQLFetcher = require('../util/graphQLFetcher');

var _graphQLFetcher2 = _interopRequireDefault(_graphQLFetcher);

var _userValidation = require('../util/userValidation');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var questionNames = ['completeness'];

var _loadCommand = (0, _loadCommand3.default)('review');

var parse = _loadCommand.parse,
    usage = _loadCommand.usage,
    commandDescriptor = _loadCommand.commandDescriptor;
exports.parse = parse;
exports.usage = usage;
exports.commandDescriptor = commandDescriptor;
var invoke = exports.invoke = (0, _composeInvoke2.default)(parse, usage, function (args, notify, options) {
  var lgJWT = options.lgJWT,
      lgUser = options.lgUser,
      formatError = options.formatError,
      formatMessage = options.formatMessage;

  var notifyCallbacks = {
    msg: function msg(_msg) {
      return notify(formatMessage(_msg));
    },
    error: function error(err) {
      return notify(formatError(err));
    }
  };

  if (!lgJWT || !(0, _userValidation.userIsPlayer)(lgUser)) {
    return Promise.reject('You are not a player in the game.');
  }
  if (isResponseCommand(args)) {
    return handleProjectReview(lgJWT, args, notifyCallbacks).catch(function (err) {
      _errorReporter2.default.captureException(err);
      notify(formatError(err.message || err));
    });
  }

  if (isStatusCommand(args)) {
    return handleProjectReviewStatus(lgJWT, args, notifyCallbacks).catch(function (err) {
      _errorReporter2.default.captureException(err);
      notify(formatError(err.message || err));
    });
  }

  return Promise.reject('Invalid arguments. Try --help for usage.');
});

function isStatusCommand(args) {
  return args._.length === 1;
}

function handleProjectReview(lgJWT, args, _ref) {
  var msg = _ref.msg;

  var projectName = args._[0].replace('#', '');
  var responses = questionNames.filter(function (questionName) {
    return questionName in args;
  }).map(function (questionName) {
    return {
      questionName: questionName,
      responseParams: [args[questionName]]
    };
  });

  return invokeSaveProjectReviewCLISurveyResponsesAPI(lgJWT, projectName, responses).then(function () {
    return invokeGetProjectReviewSurveyStatusAPI(lgJWT, projectName);
  }).then(function (_ref2) {
    var completed = _ref2.completed;
    return msg(projectReviewRecordedSuccessMessage(projectName, args, completed));
  });
}

function invokeSaveProjectReviewCLISurveyResponsesAPI(lgJWT, projectName, responses) {
  var mutation = {
    query: '\nmutation($projectName: String!, $responses: [CLINamedSurveyResponse]!) {\n  saveProjectReviewCLISurveyResponses(projectName: $projectName, responses: $responses) {\n    createdIds\n  }\n}\n    ',
    variables: { projectName: projectName, responses: responses }
  };
  return (0, _graphQLFetcher2.default)(lgJWT, (0, _getServiceBaseURL2.default)(_getServiceBaseURL.GAME))(mutation).then(function (data) {
    return data.saveProjectReviewCLISurveyResponses;
  });
}

function projectReviewRecordedSuccessMessage(projectName, args, completed) {
  var msg = '';
  if (args._[1]) {
    msg += 'Completeness score captured for #' + projectName + '!';
  }

  if (completed) {
    msg += ' Review is complete. Thank you for your input.';
  } else {
    msg += ' Review is not yet complete.';
  }
  return msg;
}

function isResponseCommand(args) {
  return Boolean(typeof args._[1] === 'number');
}

function handleProjectReviewStatus(lgJWT, args, _ref3) {
  var msg = _ref3.msg;

  var projectName = args._[0].replace('#', '');

  return invokeGetProjectReviewSurveyStatusAPI(lgJWT, projectName).then(function (result) {
    return msg(projectReviewStatusMessage(projectName, result));
  });
}

function invokeGetProjectReviewSurveyStatusAPI(lgJWT, projectName) {
  var query = {
    query: '\nquery($projectName: String!) {\n  getProjectReviewSurveyStatus(projectName: $projectName) {\n    project { artifactURL }\n    completed\n    responses {\n      questionName\n      values {\n        value\n      }\n    }\n  }\n}\n    ',
    variables: { projectName: projectName }
  };
  return (0, _graphQLFetcher2.default)(lgJWT, (0, _getServiceBaseURL2.default)(_getServiceBaseURL.GAME))(query).then(function (data) {
    return data.getProjectReviewSurveyStatus;
  });
}

function projectReviewStatusMessage(projectName, status) {
  var statusMessage = '';

  if (status.responses.length > 0) {
    statusMessage += '*Your Review of ' + projectName + ' for this cycle is ' + (status.completed ? 'complete' : 'not complete') + '.*\n\n';
    statusMessage += '_Your Responses are:_\n';
    questionNames.forEach(function (questionName) {
      var response = status.responses.find(function (r) {
        return r.questionName === questionName;
      });
      if (response) {
        statusMessage += '  \u2022 ' + questionName + ': `' + response.values[0].value + '`\n';
      } else {
        statusMessage += '  \u2022 ' + questionName + ': N/A\n';
      }
    });
  } else {
    statusMessage += 'You have not reviewed the ' + projectName + ' project this cycle\n';
  }

  if (!status.completed) {
    if (status.project.artifactURL) {
      statusMessage += '\nThe artifact for the ' + projectName + ' project is here:\n  ' + status.project.artifactURL;
    } else {
      statusMessage += '\nThe artifact URL for the ' + projectName + ' project has not been set by that team.';
    }
  }

  return statusMessage;
}
