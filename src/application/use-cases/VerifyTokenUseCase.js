class VerifyTokenUseCase {
  constructor({ tokenService }) {
    this.tokenService = tokenService;
  }

  execute(token) {
    if (!token) return { valid: false, reason: 'Token requerido' };

    const payload = this.tokenService.verify(token);
    if (!payload) return { valid: false, reason: 'Token inválido' };

    return { valid: true, user: payload };
  }
}

module.exports = VerifyTokenUseCase;

