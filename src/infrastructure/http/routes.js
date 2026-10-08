const express = require('express');

function getClientIp(req) {
  return (req.ip || '').replace('::ffff:', '');
}

function createRoutes({ loginUseCase, authMiddleware }) {
  const router = express.Router();

  router.get('/health', (req, res) => res.json({ status: 'ok' }));

  router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const result = loginUseCase.execute({
      username,
      password,
      ip: getClientIp(req),
    });

    if (!result.success) {
      return res
        .status(401)
        .json({ success: false, message: 'Credenciales inválidas' });
    }
    return res.json({ success: true, token: result.token });
  });

  router.get('/dashboard', authMiddleware, (req, res) => {
    res.json({
      success: true,
      message: 'Bienvenido al Dashboard protegido por JWT',
      data: { serverTime: new Date(), user: req.user },
    });
  });

  return router;
}

module.exports = createRoutes;