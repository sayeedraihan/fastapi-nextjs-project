"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useStudent } from "../contexts/student-context"

const Header = () => {
    const pathname = usePathname();
    const { selectedStudent } = useStudent();
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
                bg-surface shadow-lg 
                border-subtle border-b-2
                flex items-center justify-center 
                gap-x-4 sm:gap-x-6
                font-bold text-textprimary 
            "
        >
            {linkRefs.map((linkRef) => {
                const isActive = 
                    pathname === linkRef.linkUrl || 
                    (pathname.startsWith(linkRef.linkUrl) && linkRef.linkUrl !== "./");

                    // Define classes for better readability
                const baseLinkClasses = "my-4 py-2 px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base";
                const activeLinkClasses = "bg-primary text-white font-semibold shadow-inner ";
                const inactiveLinkClasses = "text-textprimary hover:bg-primary/10";

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