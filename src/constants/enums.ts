export enum Permissions {
  ConsoleCreate = 'console.create',
  ConsoleDelete = 'console.delete',
  ProgrammaticCreate = 'programmatic.create',
  ProgrammaticDelete = 'programmatic.delete',
  RoleManagementAll = 'role-management.all',
  AuditLogsAll = 'audit-logs.all',
  Admin = 'admin',
}

export enum ListLogsOrderBy {
  RequestArrivalTime = 'request_arrival_time',
  TimeTaken = 'time_taken',
}

export enum OrderByDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}
