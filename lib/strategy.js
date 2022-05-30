var passport = require('passport-strategy')
  , util = require('util')

function Strategy(options, verify) {
  options = options || {};
  
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

Strategy.prototype.authenticate = function(req, options) {
  console.log('ethereum authenticate...');
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
