'use strict';

module.exports = appInfo => {
  const config = {};

  config.middleware = [ 'error_handle', 'access_log', 'not_found', 'parse_body' ];

  return config;
};