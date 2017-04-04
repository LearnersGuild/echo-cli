'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _formUrlencoded = require('form-urlencoded');

var _formUrlencoded2 = _interopRequireDefault(_formUrlencoded);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var LGRC_FILENAME = _path2.default.join(process.env.HOME, '.lgrc');

function getUserOptions() {
  try {
    var stats = _fs2.default.statSync(LGRC_FILENAME);
    if (stats.isFile()) {
      var userOptions = JSON.parse(_fs2.default.readFileSync(LGRC_FILENAME).toString());
      return userOptions;
    }
  } catch (err) {
    return null;
  }
}

function invokeCommandAPI(command, text, options) {
  process.env.APP_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://game.learnersguild.org' : 'http://game.learnersguild.dev';

  var body = (0, _formUrlencoded2.default)({
    command: '/' + command,
    text: text
  });
  var apiURL = process.env.APP_BASE_URL + '/command';
  return (0, _isomorphicFetch2.default)(apiURL, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + options.lgJWT,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: body
  }).then(function (resp) {
    return resp.json().then(function (result) {
      if (resp.ok) {
        return result;
      }
      throw new Error(result.text || result);
    }).catch(function (err) {
      console.error('ERROR invoking ' + apiURL + ': ' + resp.status + ' ' + resp.statusText);
      throw err;
    });
  });
}

function run(commandAndArgv) {
  var options = Object.assign({}, getUserOptions(), { maxWidth: process.stdout.columns });
  if (!options) {
    throw new Error('*** Error: No Learners Guild RC file found in ' + LGRC_FILENAME + ' -- try creating one.');
  }

  var _commandAndArgv = _toArray(commandAndArgv),
      commandName = _commandAndArgv[0],
      argv = _commandAndArgv.slice(1);

  return invokeCommandAPI(commandName, argv.join(' '), options);
}

function printResult(result) {
  if (!result.text) {
    console.info(_util2.default.inspect(result, { depth: 4 }));
    return;
  }
  console.info(result.text);
  var attachmentTexts = (result.attachments || []).map(function (attachment) {
    return attachment.text;
  });
  console.info('-> ', attachmentTexts.join('\n-> '));
}

if (!module.parent) {
  /* eslint-disable xo/no-process-exit */
  var argv = process.argv.slice(2);
  run(argv).then(function (result) {
    printResult(result);
    process.exit(0);
  }).catch(function (err) {
    console.error(err.stack || err.message || err);
    process.exit(-1);
  });
}