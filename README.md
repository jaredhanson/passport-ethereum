# passport-ethereum-siwe

[Passport](https://www.passportjs.org/) strategy for authenticating
with [Sign-In with Ethereum](https://login.xyz/).

This module lets you authenticate using [Sign-In with Ethereum](https://eips.ethereum.org/EIPS/eip-4361)
in your Node.js applications.  By plugging into Passport, Ethereum
authentication can be easily and unobtrusively integrated into any application
or framework that supports [Connect](https://github.com/senchalabs/connect#readme)-style
middleware including [Express](https://expressjs.com/).

## Install

```sh
$ npm install passport-ethereum-siwe
```

## Usage

The Ethereum authentication strategy authenticates users using an Ethereum
wallet.

The strategy takes a `verify` function as an argument, which accepts `address`
as an argument.  `address` is the user's Ethereum address.  When authenticating
a user, this strategy obtains this information from a message signed by the
user's wallet.

The `verify` function is responsible for determining the user to which the
address belongs.  In cases where the account is logging in for the first time, a
new user record is typically created automatically.  On subsequent logins, the
existing user record will be found via its relation to the address.

Because the `verify` function is supplied by the application, the app is free to
use any database of its choosing.  The example below illustrates usage of a SQL
database.

```js
var EthereumStrategy = require('passport-ethereum-siwe');
var SessionNonceStore = require('passport-ethereum-siwe').SessionNonceStore;

var store = new SessionChallengeStore();

passport.use(new EthereumStrategy({ store: store },
  function verify(address, cb) {
    db.get('SELECT * FROM blockchain_credentials WHERE chain = ? AND address = ?', [
      'eip155:1',
      address
    ], function(err, row) {
      if (err) { return cb(err); }
      if (!row) {
        db.run('INSERT INTO users (username) VALUES (?)', [
          address
        ], function(err) {
          if (err) { return cb(err); }
          var id = this.lastID;
          db.run('INSERT INTO blockchain_credentials (user_id, chain, address) VALUES (?, ?, ?)', [
            id,
            'eip155:1',
            address
          ], function(err) {
            if (err) { return cb(err); }
            var user = {
              id: id,
              username: address
            };
            return cb(null, user);
          });
        });
      } else {
        db.get('SELECT rowid AS id, * FROM users WHERE rowid = ?', [ row.user_id ], function(err, row) {
          if (err) { return cb(err); }
          if (!row) { return cb(null, false); }
          return cb(null, row);
        });
      }
    });
  }
));
```

#### Define Routes

Two routes are needed in order to allow users to log in with their Ethereum
wallet.

The first route generates a randomized nonce, saves it in the `NonceStore`, and
sends it to the client-side JavaScript for it to be included in the signed
message.  This is necessary in order to protect against replay attacks.

```js
router.post('/login/ethereum/challenge', function(req, res, next) {
  store.challenge(req, function(err, nonce) {
    if (err) { return next(err); }
    res.json({ nonce: nonce });
  });
});
```

The second route authenticates the signed message and logs the user in.

```js
router.post('/login/ethereum',
  passport.authenticate('ethereum', { failWithError: true }),
  function(req, res, next) {
    res.json({ ok: true });
  },
  function(err, req, res, next) {
    res.json({ ok: false });
  });
```

## Examples

* [todos-express-ethereum](https://github.com/passport/todos-express-ethereum)

  Illustrates how to use the Ethereum strategy within an Express application.

## License

[The MIT License](https://opensource.org/licenses/MIT)

Copyright (c) 2022 Jared Hanson <[https://www.jaredhanson.me/](https://www.jaredhanson.me/)>
