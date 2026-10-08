function createAuthMiddleware(verifyTokenUseCase) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    const result = verifyTokenUseCase.execute(token);
    if (!result.valid) {
      return res.status(401).json({ success: false, message: result.reason });
    }

    req.user = result.user;
    next();
  };
}

module.exports = createAuthMiddleware;