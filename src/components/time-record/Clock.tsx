'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ClockProps {
  className?: string
}

export function Clock({ className }: ClockProps) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className={cn('font-mono', className)}>
      {time.toLocaleTimeString()}
    </div>
  )
} 