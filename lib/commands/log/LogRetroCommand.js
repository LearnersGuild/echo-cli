'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _errorReporter = require('../../util/errorReporter');

var _errorReporter2 = _interopRequireDefault(_errorReporter);

var _graphQLFetcher = require('../../util/graphQLFetcher');

var _graphQLFetcher2 = _interopRequireDefault(_graphQLFetcher);

var _getServiceBaseURL = require('../../util/getServiceBaseURL');

var _getServiceBaseURL2 = _interopRequireDefault(_getServiceBaseURL);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LogRetroCommand = function () {
  function LogRetroCommand(lgJWT, notify, formatMessage, formatError) {
    _classCallCheck(this, LogRetroCommand);

    this.runGraphQLQuery = (0, _graphQLFetcher2.default)(lgJWT, (0, _getServiceBaseURL2.default)(_getServiceBaseURL.GAME));
    this.notifyMsg = function (msg) {
      return notify(formatMessage(msg));
    };
    this.notifyError = function (err) {
      return notify(formatError(err));
    };
  }

  _createClass(LogRetroCommand, [{
    key: 'invokeResponseAPI',
    value: function invokeResponseAPI(questionNumber, responseParams, projectName) {
      var mutation = {
        query: '\n        mutation($response: CLISurveyResponse!, $projectName: String) {\n          saveRetrospectiveCLISurveyResponse(response: $response, projectName: $projectName) {\n            createdIds\n          }\n        }\n      ',
        variables: { response: { questionNumber: questionNumber, responseParams: responseParams }, projectName: projectName }
      };
      return this.runGraphQLQuery(mutation).then(function (data) {
        return data.saveRetrospectiveCLISurveyResponse;
      });
    }
  }, {
    key: 'invokeSurveyQuestionAPI',
    value: function invokeSurveyQuestionAPI(questionNumber, projectName) {
      var query = {
        query: 'query($questionNumber: Int!, $projectName: String) {\n          getRetrospectiveSurveyQuestion(questionNumber: $questionNumber, projectName: $projectName) {\n            ... on SurveyQuestionInterface {\n              id subjectType responseType body\n              responseInstructions\n            }\n            ... on SinglePartSubjectSurveyQuestion {\n              subject { id name handle }\n              response { value }\n            }\n            ... on MultiPartSubjectSurveyQuestion {\n              subject { id name handle }\n              response { value }\n            }\n          }\n        }',
        variables: { questionNumber: questionNumber, projectName: projectName }
      };
      return this.runGraphQLQuery(query).then(function (data) {
        return data.getRetrospectiveSurveyQuestion;
      });
    }
  }, {
    key: 'invokeGetSurveyAPI',
    value: function invokeGetSurveyAPI(projectName) {
      var query = {
        query: 'query($projectName: String) {\n          getRetrospectiveSurvey(projectName: $projectName) {\n            questions {\n              ... on SurveyQuestionInterface {\n                id subjectType responseType body\n                responseInstructions\n              }\n              ... on SinglePartSubjectSurveyQuestion {\n                subject { id name handle }\n                response { value }\n              }\n              ... on MultiPartSubjectSurveyQuestion {\n                subject { id name handle }\n                response { value }\n              }\n            }\n          }\n        }',
        variables: { projectName: projectName }
      };
      return this.runGraphQLQuery(query).then(function (data) {
        return data.getRetrospectiveSurvey;
      });
    }
  }, {
    key: 'formatQuestion',
    value: function formatQuestion(question, _ref) {
      var questionNumber = _ref.questionNumber,
          skipInstructions = _ref.skipInstructions;

      var questionText = '*Q' + questionNumber + '*: ' + question.body;
      if (!skipInstructions && question.responseInstructions) {
        questionText = questionText + '\n\n' + question.responseInstructions;
      }
      return questionText;
    }
  }, {
    key: 'completedStatusMessage',
    value: function completedStatusMessage() {
      return ['Nice work! You\'ve completed 100% of the reflections.', '', 'To edit any of your reflections, just log it again before the end of the cycle.'].join('\n');
    }
  }, {
    key: 'incompleteStatusMessage',
    value: function incompleteStatusMessage(responseCount, questionCount) {
      return ['You have logged ' + responseCount + '/' + questionCount + ' of your reflections for this retrospective.' + '  Run `/log -r.` at any time to check your progress.', '', '  To log a reflection, pick a question using the command:', '  `/log -r -q<integer from 1-12>`', '', '  For example:', '  `/log -r -q3` => show question 3 (of 12)', '', '  Then follow the instructions specified in the question to answer.'].join('\n');
    }
  }, {
    key: 'statusMessage',
    value: function statusMessage(survey) {
      var responseCount = survey.questions.filter(function (q) {
        return q.response;
      }).length;
      return responseCount === survey.questions.length ? this.completedStatusMessage() : this.incompleteStatusMessage(responseCount, survey.questions.length);
    }
  }, {
    key: 'printSurvey',
    value: function printSurvey(projectName) {
      var _this = this;

      return this.invokeGetSurveyAPI(projectName).then(function (survey) {
        var questionList = survey.questions.map(function (question, i) {
          return _this.formatQuestion(question, { questionNumber: i + 1, skipInstructions: true });
        }).join('\n');

        return _this.notifyMsg([_this.statusMessage(survey), '', questionList].join('\n'));
      }).catch(function (err) {
        _errorReporter2.default.captureException(err);
        _this.notifyError('' + (err.message || err));
      });
    }
  }, {
    key: 'printSurveyQuestion',
    value: function printSurveyQuestion(questionNumber, projectName) {
      var _this2 = this;

      return this.invokeSurveyQuestionAPI(questionNumber, projectName).then(function (question) {
        return _this2.notifyMsg(_this2.formatQuestion(question, { questionNumber: questionNumber }));
      }).catch(function (err) {
        _errorReporter2.default.captureException(err);
        _this2.notifyError('' + (err.message || err));
      });
    }
  }, {
    key: 'logReflection',
    value: function logReflection(questionNumber, responseParams, projectName) {
      var _this3 = this;

      return this.invokeResponseAPI(questionNumber, responseParams, projectName).then(function () {
        return _this3.notifyMsg('Reflection logged for question ' + questionNumber);
      }).catch(function (err) {
        _errorReporter2.default.captureException(err);
        _this3.notifyError(err.message || err);
      });
    }
  }]);

  return LogRetroCommand;
}();

exports.default = LogRetroCommand;
module.exports = exports['default'];