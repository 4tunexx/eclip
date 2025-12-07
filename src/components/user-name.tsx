import { cn } from '@/lib/utils'

type Props = {
  username: string
  role?: string | null
  className?: string
}

function roleClass(role?: string | null) {
  switch ((role || '').toUpperCase()) {
    case 'ADMIN':
      return 'text-red-500 font-bold'
    case 'MOD':
    case 'MODERATOR':
      return 'text-green-500'
    case 'VIP':
      return 'text-purple-500'
    case 'INSIDER':
      return 'text-orange-500'
    default:
      return 'text-white'
  }
}

export function UserName({ username, role, className }: Props) {
  return <span className={cn(roleClass(role), className)}>{username}</span>
}

