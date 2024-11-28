export class PermissionAlreadyPresentError extends Error {
  constructor() {
    super('permission already present in provided role');
  }
}

export class RoleNotFoundError extends Error {
  constructor() {
    super('role not found');
  }
}

export class RolePermissionsCombinationNotExist extends Error {
  constructor() {
    super('provided combination of role and permissions does not exist');
  }
}
