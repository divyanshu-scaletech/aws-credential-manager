export class CannotAssignActionError extends Error {
  constructor() {
    super('provided action is not allowed');
  }
}
