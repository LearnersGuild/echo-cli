'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _gitConfig = require('git-config');

var _gitConfig2 = _interopRequireDefault(_gitConfig);

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _formUrlencoded = require('form-urlencoded');

var _formUrlencoded2 = _interopRequireDefault(_formUrlencoded);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var LGRC_FILENAME = _path2.default.join(process.env.HOME, '.lgrc');

function getOptions(opts) {
  var options = {
    appBaseURL: process.env.NODE_ENV === 'production' ? 'https://game.learnersguild.org' : 'http://game.learnersguild.dev'
  };
  if (opts.token) {
    if (!opts.handle) {
      var _gitConfig$sync = _gitConfig2.default.sync();

      var handle = _gitConfig$sync.github.user;

      options.handle = handle;
    }
  } else if (!opts.lgJWT) {
    try {
      var stats = _fs2.default.statSync(LGRC_FILENAME);
      if (stats.isFile()) {
        var userOptions = JSON.parse(_fs2.default.readFileSync(LGRC_FILENAME).toString());
        options.lgJWT = userOptions.lgJWT;
        options.handle = userOptions.lgUser.handle;
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
      // ignore -- couldn't find LGRC_FILENAME
    }
  }

  return options;
}

function invokeCommandAPI(command, text, options) {
  var apiURL = options.appBaseURL + '/command';
  var headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json'
  };
  if (options.lgJWT) {
    headers.Authorization = 'Bearer ' + options.lgJWT;
  }
  var body = {
    command: '/' + command,
    text: text
  };
  if (options.handle && options.token) {
    body.token = options.token;
    body.user_name = options.handle; // eslint-disable-line camelcase
  }
  return (0, _isomorphicFetch2.default)(apiURL, {
    method: 'POST',
    headers: headers,
    body: (0, _formUrlencoded2.default)(body)
  }).then(function (resp) {
    return resp.json().then(function (result) {
      if (resp.ok) {
        return result;
      }
      var err = new Error(result.text || result);
      err.result = result;
      throw err;
    }).catch(function (err) {
      console.error('ERROR invoking ' + apiURL + ': ' + resp.status + ' ' + resp.statusText);
      throw err;
    });
  });
}

function run(opts, argv) {
  var options = _extends({}, getOptions(opts), opts);
  if (!options.lgJWT) {
    if (!options.handle && !options.token) {
      throw new Error('You must authenticate. Try --help.');
    }
  }

  var _argv = _toArray(argv);

  var commandName = _argv[0];

  var args = _argv.slice(1);

  return invokeCommandAPI(commandName, args.join(' '), options);
}

function printResult(result) {
  var log = arguments.length <= 1 || arguments[1] === undefined ? console.info : arguments[1];

  if (!result.text) {
    log(_util2.default.inspect(result, { depth: 4 }));
    return;
  }
  log(result.text);
  var attachmentTexts = (result.attachments || []).map(function (attachment) {
    return attachment.text;
  });
  if (attachmentTexts.length > 0) {
    log('-> ', attachmentTexts.join('\n-> '));
  }
}

function usage() {
  return '\nUsage: npm run command -- [opts] CMD [cmd-opts] [SUBCMD [subcmd-opts]]\n\nOptions:\n  --help             Print this help message\n\nAuth using token and handle:\n  --token=TOKEN      CLI command token to send to the API\n\n  --handle=HANDLE    run command as the user with this handle\n                     (may also be read from ~/.gitconfig file)\n\nAuth using JWT:\n  --lgJWT=JWT        Learners Guild JWT to use as authentication\n                     (may also be read from ~/.lgrc file)\n';
}

if (!module.parent) {
  /* eslint-disable xo/no-process-exit */
  var argv = process.argv.slice(2);
  var cmdIdx = argv.findIndex(function (arg) {
    return !arg.match(/^-/);
  });
  var runArgv = argv.slice(0, cmdIdx >= 0 ? cmdIdx : argv.length + 1);
  var cmdArgv = argv.slice(cmdIdx);
  var opts = (0, _minimist2.default)(runArgv);
  if (opts.help) {
    console.info(usage());
    process.exit(0);
  }
  var help = opts.help;
  var _ = opts._;

  var filteredOpts = _objectWithoutProperties(opts, ['help', '_']); // eslint-disable-line no-unused-vars


  run(filteredOpts, cmdArgv).then(function (result) {
    printResult(result);
    process.exit(0);
  }).catch(function (err) {
    if (err.result) {
      printResult(err.result, console.error);
    } else {
      console.error(err.stack || err.message || err);
    }
    process.exit(-1);
  });
}