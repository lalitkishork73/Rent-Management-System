import { useMutation } from "@tanstack/react-query";
import { GenerateOtp } from "../api/auth.api";


export function useResendOtp(){
    return useMutation({
        mutationFn:GenerateOtp
    })
}