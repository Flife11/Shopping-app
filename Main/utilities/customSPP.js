const passport = require('passport')
const { Strategy } = require('passport-strategy')

class MyStrategy extends Strategy {
  constructor(options, verify) {
    super()
    this.name = 'myStrategy'
    this.verify = verify

    this.usernameField = (options && options.username) ? options.username : 'username';
    this.passwordField = (options && options.password) ? options.password : 'password';

    passport.strategies[this.name] = this;
  }

  authenticate(req,res, options) {
    const username = req.body[this.usernameField];
    const password = req.body[this.passwordField];

    this.verify(username, password,(err, user) => {
      if (err) {
        return this.fail(err)
      }
      if (!user) {
        return this.fail('Invalid authentication', 400)
      }

      return this.success(user)

    })
  }
}

// class GGStrategy extends Strategy {
//   constructor(options, verify) {
//     super()
//     this.name = 'google'
//     this.verify = verify

//     this.tokenField = (options && options.token) ? options.token : 'token';

//     passport.strategies[this.name] = this;
  
//   }
//   authenticate(req, options) {
//     const token = req.query[this.tokenField];
//     this.verify(token, (err, user) => {
//       if (err) {
//         return this.fail(err)
//       }
//       if (!user) {
//         return this.fail('Invalid authentication', 401)
//       }
//       this.success(user)
//     })
//   }
// }

module.exports = {
  MyStrategy
 // GGStrategy
};