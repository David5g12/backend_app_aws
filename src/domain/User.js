class User {
  constructor({ username, password, role }) {
    this.username = username;
    this.password = password;
    this.role = role;
  }

  passwordMatches(plainPassword) {
    return this.password === plainPassword;
  }
}

module.exports = User;

