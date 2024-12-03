export class CannotAssignActionError extends Error {
  constructor() {
    super('provided action is not allowed');
  }
}

export class IamUserNotFoundError extends Error {
  constructor() {
    super('Iam User not found');
  }
}
