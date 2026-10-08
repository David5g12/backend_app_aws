const jwt = require('jsonwebtoken');
const TokenService = require('../../application/ports/TokenService');

class JwtTokenService extends TokenService {
  constructor(secret, expiresIn = '1h') {
    super();
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  generate(payload) {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verify(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (err) {
      return null;
    }
  }
}

module.exports = JwtTokenService;