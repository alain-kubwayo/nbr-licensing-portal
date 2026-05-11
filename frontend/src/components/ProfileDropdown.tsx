import { LogOutIcon } from "lucide-react"
import { useNavigate } from "react-router"
import { useAuth } from "@/auth/useAuth"
import { Button } from "./ui/button"

const ProfileDropdown = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground text-sm">{user?.email ?? ""}</span>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => {
          logout()
          navigate("/")
        }}
      >
        <LogOutIcon className="size-4" />
        Logout
      </Button>
    </div>
  )
}

export default ProfileDropdown
