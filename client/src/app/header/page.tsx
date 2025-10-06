"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSelectedStudent } from "../contexts/student-context"

const Header = () => {
    const pathname = usePathname();
    const { selectedStudent } = useSelectedStudent();
    const linkRefs = [
        {
            linkName: "Home",
            linkUrl: "/home"
        },
        {
            linkName: "List of Students",
            linkUrl: "/student-list"
        },
        {
            linkName: "Student Details",
            linkUrl: `/student-details/${selectedStudent.id}`
        },
        {
            linkName: "Add New Students",
            linkUrl: "/create-student"
        }
    ]
    return (
        <div 
            className="
                mr-2
                h-12 w-full 
                py-8
                bg-primaryorbackground shadow-lg 
                border-bordercolor border-b-2
                flex items-center justify-center 
                gap-x-4 sm:gap-x-6
                font-bold text-fontcolor 
            "
        >
            {linkRefs.map((linkRef) => {
                const isActive = 
                    pathname === linkRef.linkUrl || 
                    (pathname.startsWith(linkRef.linkUrl) && linkRef.linkUrl !== "./");

                    // Define classes for better readability
                const baseLinkClasses = "my-4 py-2 px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base";
                const activeLinkClasses = "bg-bordercolor text-fontcolor font-semibold shadow-inner ";
                const inactiveLinkClasses = "text-fontcolor hover:bg-secondary hover:text-fontcolor";

                return (
                    <Link 
                        key={linkRef.linkName} 
                        href={linkRef.linkUrl} 
                        className={`${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`} >
                            {linkRef.linkName}
                    </Link>
                )
            })}
        </div>
    )
}

export default Header;