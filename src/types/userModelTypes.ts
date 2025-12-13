//================= USER ================//

export interface UserAttributes {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: Roles;
  refreshToken: string;
}

export enum Roles {
  User = "user",
  Admin = "admin"
}

export const TokenDuration = {
  accessTokenDuration: '3h',
  refreshTokenDuration: '30d',
};