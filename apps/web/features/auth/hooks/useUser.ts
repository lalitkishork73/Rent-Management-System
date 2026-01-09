import { useMutation } from "@tanstack/react-query";
import { getMe } from "../api/auth.api";


export function useGetME(){
    return useMutation({
        mutationFn:getMe,
        
    })
}