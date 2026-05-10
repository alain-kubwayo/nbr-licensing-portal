import type { ReactNode } from "react"
import { Avatar } from "./ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { LogOutIcon } from "lucide-react"

type Props = {
  trigger: ReactNode
  defaultOpen?: boolean
  align?: 'start' | 'center' | 'end'
}

 type User = {
  id: number
  firstName: string
  lastName: string
  email: string
  password: string
  role: string
}

const user: Partial<User> = {
  id: 1,
  firstName: "john",
  lastName: "doe",
  email: "john.doe@gmail.com",
  role: "APPLICANT", // APPLICANT, REVIEWER, APPROVER, AUDITOR, ADMIN
}

const ProfileDropdown = ({ trigger, defaultOpen, align = "end"}: Props) => {
  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className='w-80' align={align || 'end'}>
        <DropdownMenuLabel className='flex items-center gap-4 px-4 py-2.5 font-normal'>
          <div className='relative'>
            <Avatar className='size-10 rounded-md flex items-center justify-center'>
              {`${user.firstName?.charAt(0).toUpperCase()}${user.lastName?.charAt(0).toUpperCase()}`}
            </Avatar>
            <span className='ring-card absolute right-0 bottom-0 block size-2 rounded-full bg-green-600 ring-2' />
          </div>
          <div className='flex flex-1 flex-col items-start'>
            <span className="text-foreground text-lg font-semibold">
              {`${user.firstName?.charAt(0).toUpperCase()}${user.firstName?.slice(1)} ${user.lastName?.charAt(0).toUpperCase()}${user.lastName?.slice(1)}`}
            </span>
            <span className='text-muted-foreground text-base'>{user.email}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant='destructive' className='px-4 py-2.5 text-base'>
          <LogOutIcon className='size-5' />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileDropdown
