// import { useMutation } from "@tanstack/react-query";
// import { Logout } from "@/features/auth/api/auth.api";
// import { clearAuth } from "@/shared/store/authStore";
// import { setAccessToken } from '@/shared/store/authStore';
// import { useRouter } from "next/navigation";




// export function useLogout(){
//      const router = useRouter()
//     return useMutation({
//         mutationFn:Logout,
//         onSettled:()=>{
//             clearAuth();
//             router.replace('/')
//         }
//         },
//     )
// }


// features/auth/hooks/useLogout.ts
import { useRouter } from 'next/navigation'
import { clearAuth } from '@/shared/store/authStore'
import { Logout } from '@/features/auth/api/auth.api'

export function useLogout() {
  const router = useRouter()

  return async () => {
    try {
      await Logout()
    } finally {
      clearAuth()
    //   router.replace('/')
    window.location.reload()
    }
  }
}
