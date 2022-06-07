var chai = require('chai');
var sinon = require('sinon');
var Strategy = require('../lib/strategy');


describe('Strategy', function() {
  
  it('should be named ethereum', function() {
    var strategy = new Strategy(function(){});
    
    expect(strategy.name).to.equal('ethereum');
  });
  
  it('should verify address', function(done) {
    chai.passport.use(new Strategy(function(address, cb) {
      expect(address).to.equal('0xCC6F4DF4B758C4DE3203e8842E2d8CAc564D7758');
      return cb(null, { id: '248289761001' });
    }))
      .request(function(req) {
        req.connection = {};
        req.headers.host = 'localhost:3000';
        req.body = {
          message: 'localhost:3000 wants you to sign in with your Ethereum account:\n' +
            '0xCC6F4DF4B758C4DE3203e8842E2d8CAc564D7758\n' +
            '\n' +
            'Sign in with Ethereum to the app.\n' +
            '\n' +
            'URI: http://localhost:3000\n' +
            'Version: 1\n' +
            'Chain ID: 1\n' +
            'Nonce: VjglqeaSMDbPSYe0K\n' +
            'Issued At: 2022-06-07T16:28:10.957Z',
          signature: '0xb303d03782c532e2371e3d75a8b2b093c2dceb5faed5d07d6506be96be783245515db6ad55ad6d598ebdf1f7e1c5cb0d24e7147bbad47d3b9d8dfbcfab2ddcc71b'
        };
        req.session = {
          messages: [],
          'ethereum:siwe': {
            nonce: 'VjglqeaSMDbPSYe0K'
          }
        };
      })
      .success(function(user, info) {
        expect(user).to.deep.equal({ id: '248289761001' });
        expect(info).to.be.undefined;
        expect(this.session).to.deep.equal({
          messages: []
        });
        done();
      })
      .error(done)
      .authenticate();
  }); // should verify address
  
  it('should fail when address is missing from message', function(done) {
    chai.passport.use(new Strategy(function(address, cb) {
      expect(address).to.equal('0xCC6F4DF4B758C4DE3203e8842E2d8CAc564D7758');
      return cb(null, { id: '248289761001' });
    }))
      .request(function(req) {
        req.connection = {};
        req.headers.host = 'localhost:3000';
        req.body = {
          message: 'localhost:3000 wants you to sign in with your Ethereum account:\n' +
            '\n' +
            'Sign in with Ethereum to the app.\n' +
            '\n' +
            'URI: http://localhost:3000\n' +
            'Version: 1\n' +
            'Chain ID: 1\n' +
            'Nonce: VjglqeaSMDbPSYe0K\n' +
            'Issued At: 2022-06-07T16:28:10.957Z',
          signature: '0xb303d03782c532e2371e3d75a8b2b093c2dceb5faed5d07d6506be96be783245515db6ad55ad6d598ebdf1f7e1c5cb0d24e7147bbad47d3b9d8dfbcfab2ddcc71b'
        };
        req.session = {
          messages: [],
          'ethereum:siwe': {
            nonce: 'VjglqeaSMDbPSYe0K'
          }
        };
      })
      .fail(function(challenge, status) {
        expect(challenge).to.deep.equal({ message: 'Invalid message' });
        expect(status).to.equal(403);
        done();
      })
      .error(done)
      .authenticate();
  }); // should fail when address is missing from message
  
  it('should fail when missing message', function(done) {
    chai.passport.use(new Strategy(function(address, cb) {
      throw new Error('verify function should not be called');
    }))
      .request(function(req) {
        req.connection = {};
        req.headers.host = 'localhost:3000';
        req.body = {
          signature: '0xb303d03782c532e2371e3d75a8b2b093c2dceb5faed5d07d6506be96be783245515db6ad55ad6d598ebdf1f7e1c5cb0d24e7147bbad47d3b9d8dfbcfab2ddcc71b'
        };
        req.session = {
          messages: []
        };
      })
      .fail(function(challenge, status) {
        expect(challenge).to.deep.equal({ message: 'Missing message' });
        expect(status).to.equal(400);
        done();
      })
      .error(done)
      .authenticate();
  });
  
  it('should fail when missing signature', function(done) {
    chai.passport.use(new Strategy(function(address, cb) {
      throw new Error('verify function should not be called');
    }))
      .request(function(req) {
        req.connection = {};
        req.headers.host = 'localhost:3000';
        req.body = {
          message: 'localhost:3000 wants you to sign in with your Ethereum account:\n' +
            '0xCC6F4DF4B758C4DE3203e8842E2d8CAc564D7758\n' +
            '\n' +
            'Sign in with Ethereum to the app.\n' +
            '\n' +
            'URI: http://localhost:3000\n' +
            'Version: 1\n' +
            'Chain ID: 1\n' +
            'Nonce: VjglqeaSMDbPSYe0K\n' +
            'Issued At: 2022-06-07T16:28:10.957Z'
        };
        req.session = {
          messages: []
        };
      })
      .fail(function(challenge, status) {
        expect(challenge).to.deep.equal({ message: 'Missing signature' });
        expect(status).to.equal(400);
        done();
      })
      .error(done)
      .authenticate();
  });
  
});
