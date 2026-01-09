import { describe,it,expect } from "vitest";
import { login,getMe,refresh,signup,verifyOTP } from "../auth.api";

describe('auth.api (frontend)', () => { 

    it('logs in user successfully',async()=>{
        const res= await login({
            email:'lalitkishor@yopmail.com',
            password:'Pass@123456',
            clientType:"web"
        });

        expect(res).toBe('mock-access-token')
    })


     it('throws error on invalid login', async () => {
    await expect(
      login({
        email: 'fail@mail.com',
        password: 'wrong',
        clientType:'web'
      })
    ).rejects.toMatchObject({
      message: 'Invalid credentials',
    });
  });

  it('signs up user', async () => {
    const res = await signup({
      name: 'Lalit',
      email: 'lalit@mail.com',
      password: '123456',
    });

    expect(res.message).toContain('Signup successful');
  });

  it('verifies otp', async () => {
    const res = await verifyOTP({
      email: 'lalit@mail.com',
      otp: '123456',
    });

    expect(res.message).toBe('OTP verified');
  });

  it('refreshes token', async () => {
    const res = await refresh();
    expect(res.accessToken).toBe('refreshed-token');
  });

  it('fetches current user', async () => {
    const user = await getMe();

    expect(user.email).toBe('lalit@mail.com');
    expect(user.roles).toContain('USER');
  });
 })
