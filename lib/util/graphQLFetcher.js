'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = graphQLFetcher;

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//                 new preferred               old                        Rocket.Chat
var ORIGIN_URL = process.env.APP_BASE_URL || process.env.APP_BASEURL || process.env.ROOT_URL;

function graphQLFetcher(lgJWT, baseURL) {
  var origin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ORIGIN_URL;

  if (!lgJWT) {
    throw new Error('Need lgJWT to set "Authorization:" header');
  }
  if (!baseURL) {
    throw new Error('Need base URL of GraphQL API service');
  }
  if (!origin) {
    throw new Error('Need origin to set the "Origin:" HTTP header');
  }
  return function (graphQLParams) {
    var options = {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + lgJWT,
        'Origin': origin,
        'Content-Type': 'application/json',
        'LearnersGuild-Skip-Update-User-Middleware': 1
      },
      body: JSON.stringify(graphQLParams)
    };

    return (0, _isomorphicFetch2.default)(baseURL + '/graphql', options).then(function (resp) {
      if (!resp.ok) {
        return resp.text().then(function (body) {
          throw new Error(body);
        });
      }
      return resp.json();
    }).then(function (_ref) {
      var errors = _ref.errors,
          data = _ref.data;

      if (errors) {
        throw new Error(errors[0].message);
      }
      return data;
    });
  };
}
module.exports = exports['default'];