"use client"

import { Student } from "@/app/(students)/students";
import { useAuth } from "@/app/contexts/auth-context";
import { useUtilsObject, UtilsObject } from "@/app/contexts/utils_context";
import { catchError } from "@/app/routes/route_utils";
import { useRouter } from "next/navigation";
// Needed to install react-hook-form
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

export type Token = {
    access_token: string;
    token_type: string;
}

export type LoginResponse = { 
    token: Token;
    student?: Student;
    role: string;
} & UtilsObject

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const router = useRouter();
    const { setUtilsObject } = useUtilsObject();
    const { setRole } = useAuth();

    const onSubmit: SubmitHandler<FieldValues> = async (data: FieldValues) => {
        try {
            const response = await fetch("/routes/get-token", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                const responseClone = response.clone();
                const responseText = await responseClone.text();
                const loginResponse: LoginResponse = JSON.parse(responseText);
                const utilsObject: UtilsObject = { levels: loginResponse.levels, mediums: loginResponse.mediums, fields: loginResponse.fields };
                setUtilsObject(utilsObject);
                setRole(loginResponse.role);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || "login failed");
            }
            router.refresh();
        } catch (error: unknown) {
            catchError(
                error, 
                "An error occured during login. Reason: ", 
                "An error occured during login. Reason unknown."
            );
        }
    };
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <br />
                <label htmlFor="username" className="pr-2 mt-1 ml-4">Username: </label>
                <input
                    id="username" 
                    className="
                        ml-1 
                        p-1 
                        w-60 
                        border-bordercolor border-2 rounded-md 
                        focus:outline-none focus:ring-1 focus:ring-fontcolor 
                        bg-secondary 
                    "
                    {...register('username', { required: 'Username is required' })} 
                />
                {errors.username && <p>{errors.username.message as string}</p>}
            </div>
            <br />
            <div>
                <label htmlFor="password" className="pr-2 mt-1 ml-5">Password: </label>
                <input
                    id="password"
                    type="password"
                    {...register('password', { required: 'Password is required' })} 
                    className="
                        ml-1 
                        p-1 
                        w-60 
                        border-bordercolor border-2 rounded-md 
                        focus:outline-none focus:ring-1 focus:ring-fontcolor 
                        bg-secondary 
                    "
                />
                {errors.password && <p>{errors.password.message as string}</p>}
            </div>
            <br />
            <button 
                type="submit" 
                className="
                    py-2 px-4 
                    mx-2 
                    bg-primary hover:bg-primary/90 rounded-lg shadow-md 
                    text-textprimary font-bold 
                    focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-75
                    transition duration-150 ease-in-out
                "
            >
                Login
            </button>
        </form>
    )
}

export default Login;