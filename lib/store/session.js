var crypto = require('crypto');
var randtoken = require('rand-token');


function SessionStore(options) {
  options = options || {};
  this._key = options.key || 'ethereum:siwe';
}

SessionStore.prototype.challenge = function(req, cb) {
  if (!req.session) { return cb(new Error('Ethereum authentication requires session support. Did you forget to use express-session middleware?')); }
  
  var self = this;
  process.nextTick(function() {
    var nonce = randtoken.generate(16);
    req.session[self._key] = {
      nonce: nonce
    };
    return cb(null, nonce);
  });
}

SessionStore.prototype.verify = function(req, nonce, cb) {
  if (!req.session) { return cb(new Error('Ethereum authentication requires session support. Did you forget to use express-session middleware?')); }
  
  var self = this;
  process.nextTick(function() {
    var info = req.session[self._key];
    delete req.session[self._key];
    
    if (!info) {
      return cb(null, false, { message: 'Unable to verify nonce.' });
    }
    if (!info.nonce) {
      return cb(null, false, { message: 'Unable to verify nonce.' });
    }
    
    if (info.nonce !== nonce) {
      return cb(null, false, { message: 'Invalid nonce.' });
    }
    return cb(null, true);
  });
}


module.exports = SessionStore;
