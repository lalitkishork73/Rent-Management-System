export type LoginRequest={
    email: string;
    password: string;
    clientType:string;
}
export type SignupRequest={
    email: string;
    password: string;
    name:string;
}

export type LoginResponse={
    accessToken: string;
}

export type VerifyOtpRequest={
    email:string;
    otp:string;
}

export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export type AuthMeResponse = {
  id: string;
  name: string;
  email: string;
  roles: Role[];
};
