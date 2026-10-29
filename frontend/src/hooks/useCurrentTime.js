import { useEffect, useState } from 'react'

export function useCurrentTime() {
  const [currentTime, setCurrentTime] = useState(Date.now())

  useEffect(() => {
    const intervalId = window.setInterval(() => setCurrentTime(Date.now()), 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  return currentTime
}