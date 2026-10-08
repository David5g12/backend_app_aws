class TokenService {
  generate(payload) {
    throw new Error('TokenService.generate no implementado');
  }

  verify(token) {
    throw new Error('TokenService.verify no implementado');
  }
}

module.exports = TokenService;
