export type CreateIamCredentialsDetails = {
  actions: string[];
  resources: string[] | string;
  duration_in_milliseconds: number;
};

export type DeleteUserCronDetails = {
  expiration_time: Date;
  username: string;
};
