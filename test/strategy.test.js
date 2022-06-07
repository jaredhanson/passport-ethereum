var chai = require('chai');
var sinon = require('sinon');
var Strategy = require('../lib/strategy');


describe('Strategy', function() {
  
  var clock;
  
  afterEach(function() {
    clock && clock.restore();
  });
  
  
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
  
  it('should verify address and chain id', function(done) {
    chai.passport.use(new Strategy(function(address, chainId, cb) {
      expect(address).to.equal('0xCC6F4DF4B758C4DE3203e8842E2d8CAc564D7758');
      expect(chainId).to.equal(1);
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
  }); // should verify address and chain id
  
  it('should fail when URI is invalid', function(done) {
    chai.passport.use(new Strategy(function(address, cb) {
      expect(address).to.equal('0xCC6F4DF4B758C4DE3203e8842E2d8CAc564D7758');
      return cb(null, { id: '248289761001' });
    }))
      .request(function(req) {
        req.connection = {};
        req.headers.host = 'localhost:3999';
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
      .fail(function(challenge, status) {
        expect(challenge).to.deep.equal({ message: 'URI mismatch.' });
        expect(status).to.equal(403);
        done();
      })
      .error(done)
      .authenticate();
  }); // should fail when URI is invalid
  
  it('should fail when message is expired', function(done) {
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
            'Nonce: GFRz6rD1XKFyYyQT\n' +
            'Issued At: 2022-06-07T22:19:22.065Z\n' +
            'Expiration Time: 2022-06-07T22:20:22.065Z',
          signature: '0xc5050e9144943695d2ab233e3d5f205687e29735b07f4e99ef6738ff5512f249582c2b8c105c5c8b9cd9c7910e971765532a55071e0dfd2bbd13e931a024e4991c'
        };
        req.session = {
          messages: [],
          'ethereum:siwe': {
            nonce: 'GFRz6rD1XKFyYyQT'
          }
        };
      })
      .fail(function(challenge, status) {
        expect(challenge).to.deep.equal({ message: 'Expired message.' });
        expect(status).to.equal(403);
        done();
      })
      .error(done)
      .authenticate();
  }); // should fail when message is expired
  
  it('should fail when message is not yet valid', function(done) {
    clock = sinon.useFakeTimers(1654640839635);
    
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
            'Nonce: uri9Uq8fydQXUDHx\n' +
            'Issued At: 2022-06-07T22:27:19.635Z\n' +
            'Not Before: 2022-06-07T22:28:19.635Z',
          signature: '0x045404ec50df21499be5fdecbb334504070b767f75e3692a62806033d5e2e6ae70a2b13011ca34af0284b48b394994da2aeea73fe05f8fc1836e66db3f1b27521b'
        };
        req.session = {
          messages: [],
          'ethereum:siwe': {
            nonce: 'uri9Uq8fydQXUDHx'
          }
        };
      })
      .fail(function(challenge, status) {
        expect(challenge).to.deep.equal({ message: 'Message not yet valid.' });
        expect(status).to.equal(403);
        done();
      })
      .error(done)
      .authenticate();
  }); // should fail when message is not yet valid
  
  it('should fail when nonce is invalid', function(done) {
    clock = sinon.useFakeTimers(1654640839635);
    
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
            nonce: 'Xri9Uq8fydQXUDHx'
          }
        };
      })
      .fail(function(challenge, status) {
        expect(challenge).to.deep.equal({ message: 'Invalid nonce.' });
        expect(status).to.equal(403);
        done();
      })
      .error(done)
      .authenticate();
  }); // should fail when message is invalid
  
  it('should fail when signature is invalid', function(done) {
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
          signature: '0xF303d03782c532e2371e3d75a8b2b093c2dceb5faed5d07d6506be96be783245515db6ad55ad6d598ebdf1f7e1c5cb0d24e7147bbad47d3b9d8dfbcfab2ddcc71b'
        };
        req.session = {
          messages: [],
          'ethereum:siwe': {
            nonce: 'VjglqeaSMDbPSYe0K'
          }
        };
      })
      .fail(function(challenge, status) {
        expect(challenge).to.deep.equal({ message: 'Invalid signature.: 0x09967aCB4912a3efDb66039b8BC8ABb202a0f3E4 !== 0xCC6F4DF4B758C4DE3203e8842E2d8CAc564D7758' });
        expect(status).to.equal(403);
        done();
      })
      .error(done)
      .authenticate();
  }); // should fail when signature is invalid
  
  it('should fail when message is malformed (missing address)', function(done) {
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
        expect(challenge).to.deep.equal({ message: 'Malformed message.' });
        expect(status).to.equal(403);
        done();
      })
      .error(done)
      .authenticate();
  }); // should fail when message is malformed (missing address)
  
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
        expect(challenge).to.deep.equal({ message: 'Missing message.' });
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
        expect(challenge).to.deep.equal({ message: 'Missing signature.' });
        expect(status).to.equal(400);
        done();
      })
      .error(done)
      .authenticate();
  });
  
});
