const express = require('express');
const path = require('path');

const LoginUseCase = require('./src/application/use-cases/LoginUseCase');
const VerifyTokenUseCase = require('./src/application/use-cases/VerifyTokenUseCase');
const InMemoryUserRepository = require('./src/infrastructure/persistence/InMemoryUserRepository');
const JwtTokenService = require('./src/infrastructure/auth/JwtTokenService');
const FileAuthLogger = require('./src/infrastructure/logging/FileAuthLogger');
const createAuthMiddleware = require('./src/infrastructure/http/authMiddleware');
const createRoutes = require('./src/infrastructure/http/routes');

const SECRET_KEY = process.env.JWT_SECRET || 'clave_local_de_pruebas';
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET en producción');
  process.exit(1);
}

const userRepository = new InMemoryUserRepository();
const tokenService = new JwtTokenService(SECRET_KEY, '1h');
const authLogger = new FileAuthLogger(path.join(__dirname, 'logs'));

const loginUseCase = new LoginUseCase({ userRepository, tokenService, authLogger });
const verifyTokenUseCase = new VerifyTokenUseCase({ tokenService });
const authMiddleware = createAuthMiddleware(verifyTokenUseCase);

const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use('/api', createRoutes({ loginUseCase, authMiddleware }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend ejecutándose en el puerto ${PORT}`);
});