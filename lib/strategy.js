var passport = require('passport-strategy')
  , siwe = require('siwe')
  , util = require('util')
  , SessionStore = require('./store/session');

function Strategy(options, verify) {
  if (typeof options == 'function') {
    verify = options;
    options = {};
  }
  if (!verify) { throw new TypeError('EthereumStrategy requires a verify function'); }
  
  this.name = 'ethereum';
  this._verify = verify;
  this._passReqToCallback = options.passReqToCallback;
  this._store = options.store || new SessionStore();
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

Strategy.prototype.authenticate = function(req, options) {
  var message = req.body.message
    , signature = req.body.signature;
  
  if (!message) { return this.fail({ message: 'Missing message' }, 400); }
  if (!signature) { return this.fail({ message: 'Missing signature' }, 400); }
  
  var self = this;
  
  var siweMessage;
  try {
    var siweMessage = new siwe.SiweMessage(message);
  } catch(ex) {
    return self.fail({ message: 'Invalid message' }, 403);
  }
  
  this._store.verify(req, siweMessage.nonce, function(err, ok, info) {
    if (!ok) {
      return self.fail(info, 403);
    }
  
    siweMessage.validate(signature)
      .then(function(message) {
        function verified(err, user, info) {
          if (err) { return self.error(err); }
          if (!user) { return self.fail(info); }
          self.success(user, info);
        }
      
        try {
          if (self._passReqToCallback) {
            self._verify(req, message.address, verified);
          } else {
            self._verify(message.address, verified);
          }
        } catch (ex) {
          return self.error(ex);
        }
      })
      .catch(function(err) {
        return self.fail({ message: 'Invalid signature' });
      });
  });
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
