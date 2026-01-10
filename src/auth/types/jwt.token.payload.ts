import { Payload } from './payload';

export type JwtTokenPayload = {
  payload: Payload;
  accessToken: string;
  refreshToken: string;
};
