const UserRepository = require('../../application/ports/UserRepository');
const User = require('../../domain/User');

class InMemoryUserRepository extends UserRepository {
  constructor() {
    super();
    this.users = [
      new User({ username: 'admin', password: 'secreto123', role: 'admin' }),
    ];
  }

  findByUsername(username) {
    return this.users.find((u) => u.username === username) || null;
  }
}

module.exports = InMemoryUserRepository;