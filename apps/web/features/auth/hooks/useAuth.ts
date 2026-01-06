import { useAuthContext } from "../providers/AuthProvider";
import { useAuthStore } from "@/shared/store/authStore";

export function useAuth(){
    const {status}=useAuthContext()
    const user=useAuthStore((s)=>s.user)


    return {
        status,
        user,
        isLoading:status==='loading',
        isAuthenticated:status==='authenticated',
        isUnauthenticated:status==='unauthenticated'
    }
}