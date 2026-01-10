export type Payload = Record<string, any> & {
  id: string;
  email: string;
  first_name?: string;
  expiration?: number;
};
