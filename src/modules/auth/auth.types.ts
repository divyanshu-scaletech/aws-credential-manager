import { UUID } from 'crypto';

export type RegistrationDetails = {
  username: string;
  password: string;
  role_id: UUID;
};

export type LoginDetails = {
  username: string;
  password: string;
};
