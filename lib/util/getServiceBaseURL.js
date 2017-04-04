'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getServiceBaseURL;
var IDM = exports.IDM = 'idm';
var GAME = exports.GAME = 'game';

var SERVICES = [IDM, GAME];

function getServiceBaseURL(serviceName) {
  var env = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : process.env.NODE_ENV;

  if (SERVICES.indexOf(serviceName) < 0) {
    throw new Error('Invalid service name: ' + serviceName);
  }
  switch (env) {
    case 'development':
      return 'http://' + serviceName + '.learnersguild.dev';
    case 'test':
      return 'http://' + serviceName + '.learnersguild.test';
    default:
      return 'https://' + serviceName + '.learnersguild.org';
  }
}