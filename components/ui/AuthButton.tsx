'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from './button'
import { Typography } from './Typography'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface AuthButtonProps {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AuthButton({ variant = 'primary', size = 'md', className }: AuthButtonProps) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn()
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <Button variant="ghost" size={size} disabled className={className}>
        <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
      </Button>
    )
  }

  if (session) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleSignOut}
        disabled={isLoading}
        className={className}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          'Sign Out'
        )}
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSignIn}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        'Sign In'
      )}
    </Button>
  )
}

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function UserAvatar({ size = 'md', className }: UserAvatarProps) {
  const { data: session } = useSession()

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  }

  if (!session?.user) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-neutral-700 border border-neutral-600 flex items-center justify-center ${className}`}>
        <svg className="w-1/2 h-1/2 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      </div>
    )
  }

  const { user } = session
  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email?.[0]?.toUpperCase() || '?'

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium ${className}`}>
      {user.image ? (
        <Image
          src={user.image}
          alt={user.name || 'User'}
          width={40}
          height={40}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}

interface UserMenuProps {
  className?: string
}

export function UserMenu({ className }: UserMenuProps) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  if (!session?.user) {
    return <AuthButton variant="outline" />
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-neutral-800 transition-colors"
      >
        <UserAvatar size="sm" />
        <div className="hidden sm:block text-left">
          <Typography variant="small" className="text-neutral-200 font-medium">
            {session.user.name || 'User'}
          </Typography>
          <Typography variant="small" className="text-neutral-400">
            {session.user.email}
          </Typography>
        </div>
        <svg
          className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <Link
              href="/profile"
              className="block px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700 rounded transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
            <Link
              href="/chat"
              className="block px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700 rounded transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Chat History
            </Link>
            <hr className="my-2 border-neutral-700" />
            <button
              onClick={() => {
                setIsOpen(false)
                signOut()
              }}
              className="block w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-neutral-700 rounded transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 