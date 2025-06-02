"use client"

import { Crown, LogOut, Moon, Sun, User } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import Image from "next/image"
import { useCurrentUser } from "@/contexts/CurrentUserContext"
import { useRouter } from "next/navigation"
import client from "../../api/client"

const Navbar = () => {
  const { theme, setTheme } = useTheme()
  const { currentUser, loading, setCurrentUser } = useCurrentUser()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await client({ req: {} }).post("/api/users/signout")
      setCurrentUser(null)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <nav className="p-4 flex items-center justify-between sticky top-0 bg-background z-10">
      {/* LEFT */}
      <Link href="/community" className="ml-5">
        <Image src="/logo.svg" alt="logo" width={135} height={135} />
      </Link>
      {/* <Button variant="outline" onClick={toggleSidebar}>
        
      </Button> */}
      {/* RIGHT */}
      <div className="flex items-center gap-8 text-xl">
        <Link href="/community">Community</Link>
        {currentUser && !loading && (
          <>
            <Link href="/connected">Connected</Link>
            <Link href="/requests">Requests</Link>
          </>
        )}
        {!currentUser && !loading && (
          <>
            <Link href="/users/signup">Sign Up</Link>
            <Link href="/users/signin">Sign In</Link>
          </>
        )}
        {/* THEME MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* USER MENU */}
        {currentUser && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage src={currentUser.profilePicture} />
                <AvatarFallback>{currentUser.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={10}>
              <DropdownMenuLabel>{currentUser.fullName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/users/${currentUser.id}`}>
                  <User className="h-[1.2rem] w-[1.2rem] mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/premium`}>
                  <Crown className="h-[1.2rem] w-[1.2rem] mr-2" />
                  Go Premium
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                <LogOut className="h-[1.2rem] w-[1.2rem] mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  )
}

export default Navbar
