export class UsernameTakenError extends Error {
  constructor() {
    super('username already taken');
  }
}

export class RoleNotFoundError extends Error {
  constructor() {
    super('role not found');
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super('user not found');
  }
}

export class IncorrectPasswordError extends Error {
  constructor() {
    super('password is incorrect');
  }
}
