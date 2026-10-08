class LoginUseCase {
  constructor({ userRepository, tokenService, authLogger }) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
    this.authLogger = authLogger;
  }

  execute({ username, password, ip }) {
    const user = this.userRepository.findByUsername(username);

    if (!user || !user.passwordMatches(password)) {
      this.authLogger.log(username || 'unknown', false, ip);
      return { success: false };
    }

    this.authLogger.log(user.username, true, ip);
    const token = this.tokenService.generate({
      username: user.username,
      role: user.role,
    });
    return { success: true, token };
  }
}

module.exports = LoginUseCase;


