'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.setProjectArtifactURL = setProjectArtifactURL;

var _getServiceBaseURL = require('../../util/getServiceBaseURL');

var _getServiceBaseURL2 = _interopRequireDefault(_getServiceBaseURL);

var _errorReporter = require('../../util/errorReporter');

var _errorReporter2 = _interopRequireDefault(_errorReporter);

var _graphQLFetcher = require('../../util/graphQLFetcher');

var _graphQLFetcher2 = _interopRequireDefault(_graphQLFetcher);

var _userValidation = require('../../util/userValidation');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function invokeSetProjectArtifactURLAPI(lgJWT, projectName, url) {
  var mutation = {
    query: '\nmutation($projectName: String!, $url: URL!) {\n  setProjectArtifactURL(projectName: $projectName, url: $url) {\n    id\n  }\n}\n    ',
    variables: { projectName: projectName, url: url }
  };
  return (0, _graphQLFetcher2.default)(lgJWT, (0, _getServiceBaseURL2.default)(_getServiceBaseURL.GAME))(mutation).then(function (data) {
    return data.setProjectArtifactURL;
  });
}

function setProjectArtifactURL(args, notify, options) {
  var lgJWT = options.lgJWT,
      lgUser = options.lgUser,
      formatMessage = options.formatMessage,
      formatError = options.formatError;


  if (!lgJWT || !(0, _userValidation.userIsPlayer)(lgUser)) {
    return Promise.reject('You are not a player in the game.');
  }
  if (args._.length !== 2) {
    return Promise.reject('Invalid command - wrong number of arguments (' + args._.length + ' for 2). Try --help for usage.');
  }

  var _args$_ = _slicedToArray(args._, 2),
      projectNameOrChannel = _args$_[0],
      url = _args$_[1];

  var projectName = projectNameOrChannel.replace(/^#/, '');
  return invokeSetProjectArtifactURLAPI(lgJWT, projectName, url).then(function (project) {
    if (project.id) {
      notify(formatMessage('Thanks! The artifact for #' + projectName + ' is now set to ' + url + '.'));
      return;
    }
    var err = 'Expected a project id to be returned, but none was.';
    _errorReporter2.default.captureMessage(err);
    notify(formatError('Something went wrong. Please try again.'));
  }).catch(function (err) {
    _errorReporter2.default.captureException(err);
    notify(formatError(err.message || err));
  });
}