'use client'
export function useGoogleAuth() {
  const loginWithGoogle = () => {
    console.log("worked")
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      throw new Error('NEXT_PUBLIC_API_URL not defined');
    }

    // Full page redirect (IMPORTANT)
    window.location.href = `${apiUrl}auth/google`;
  };

  return { loginWithGoogle };
}
                                                                                                                                                                                                                                                                                  