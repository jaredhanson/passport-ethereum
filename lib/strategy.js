var passport = require('passport-strategy')
  , siwe = require('siwe')
  , url = require('url')
  , util = require('util')
  , utils = require('./utils')
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
  //console.log(req.body);
  
  var message = req.body.message
    , signature = req.body.signature;
  
  if (!message) { return this.fail({ message: 'Missing message.' }, 400); }
  if (!signature) { return this.fail({ message: 'Missing signature.' }, 400); }
  
  var self = this;
  
  var siweMessage;
  try {
    var siweMessage = new siwe.SiweMessage(message);
  } catch(ex) {
    return self.fail({ message: 'Malformed message.' }, 403);
  }
  
  var origin = utils.originalOrigin(req);
  if (origin !== siweMessage.uri) {
    return self.fail({ message: 'URI mismatch.' }, 403);
  }
  
  var domain = url.parse(origin).host;
  if (domain !== siweMessage.domain) {
    return self.fail({ message: 'Domain mismatch.' }, 403);
  }
  
  if (siweMessage.notBefore) {
    if (new Date(siweMessage.notBefore).getTime() > new Date().getTime()) {
      return self.fail({ message: 'Message not yet valid.' }, 403);
    }
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
            var arity = self._verify.length;
            switch (arity) {
            case 3:
              return self._verify(message.address, message.chainId, verified);
            default:
              return self._verify(message.address, verified);
            }
          }
        } catch (ex) {
          return self.error(ex);
        }
      })
      .catch(function(err) {
        return self.fail({ message: err.message || 'Invalid signature.' }, 403);
      });
  });
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
