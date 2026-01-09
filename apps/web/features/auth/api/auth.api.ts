import { apiClient } from "../../../shared/lib/apiClient";
import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  VerifyOtpRequest,
  AuthMeResponse
} from '../types/auth.types'


/**
 * ---------------------------
 * REFRESH TOKEN
 * (cookie-based for web)
 * ---------------------------
 */
export async function refresh():Promise<LoginResponse> {
    const res = await apiClient.post('/auth/refresh');
    return res.data;     
}

/**
 * ---------------------------
 * SIGNUP
 * ---------------------------
 */
export async function signup(payload:SignupRequest):Promise<{message:string}>{
    const res=await apiClient.post('/auth/signup',payload);
    return res.data;
}

/**c
 * ---------------------------
 * LOGIN (WEB)
 * ---------------------------
 */


export async function login(payload:LoginRequest):Promise<LoginResponse>{
    const res=await apiClient.post('/auth/login',payload);
    return res.data;
}


/**
 * ---------------------------
 * VERIFY OTP
 * ---------------------------
 */
export async function verifyOTP(payload:VerifyOtpRequest):Promise<{message:string}>{
  const res=await apiClient.post('/auth/verify-otp',payload);
  return res.data;
}

/**you
 * ---------------------------
 * CURRENT USER
 * ---------------------------
 */
export async function getMe():Promise<AuthMeResponse|unknown>{
    const res=await apiClient.get('/auth/me');
    return res.data;
}

export async function GenerateOtp(email:string):Promise<{message:string}>{
    const res=await apiClient.post('/otp/generate',{email:email})
    return res.data;
}
export async function GoogleAuth():Promise<{message:string}>{
    const res=await apiClient.get('/auth/google',)
    return res.data;
}

export async function Logout(){
    const res=await apiClient.post('/auth/logout',{clientType:'web'})
    return res.data;
}