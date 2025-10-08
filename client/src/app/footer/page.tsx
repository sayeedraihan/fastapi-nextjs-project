"use client"

import { useRouter } from "next/navigation";

const Footer = () => {
    const router = useRouter();
    const handleLogout = async () => {
        try {
            const response = await fetch('/routes/logout', {
                method: 'POST',
            });

            if (response.ok) {
                // On successful logout, redirect to the login page
                router.refresh();
                router.push('/login');
            } else {
            }
        } catch (error: unknown) {
            if(error instanceof Error) {
                throw new Error("An error occured during logout. Reason: " + error.message);
            } else {
                throw new Error("An error occurred during logout. Reason unknown.");
            }
        }
    };
    return (
        <div className={`bg-surface`}>
            <button 
                onClick={handleLogout}
                className="
                    py-2 px-4 
                    mx-2 my-2
                    bg-transparent hover:bg-destructive rounded-lg 
                    border border-subtle hover:border-transparent 
                    text-textprimary font-bold hover:text-textprimary 
                    focus:outline-none focus:ring-1 focus:ring-destructive focus:ring-opacity-75 
                    transition duration-150 ease-in-out
                "
            >
                Logout
            </button>
        </div>
    )
}

export default Footer;