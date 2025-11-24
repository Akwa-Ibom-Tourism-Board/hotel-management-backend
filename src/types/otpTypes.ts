export interface OtpModelTypes {
  id: string;
  otp: string;
  expiry: number;
  businessPhoneNumber: string;
  verify: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}