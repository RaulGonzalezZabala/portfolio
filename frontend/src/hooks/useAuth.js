import { useCallback, useEffect, useState } from 'react'
import {
  getCurrentUser,
  login,
  logout,
  register,
  requestPasswordReset,
  resendVerification,
  resetPassword,
  verifyEmail,
} from '../services/authApi'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    getCurrentUser()
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch((error) => {
        setUser(null)
        setLoadError(error.message)
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function signIn(email, password) {
    const result = await login(email, password)
    setUser(result.user)
  }

  async function signUp(email, password, termsAccepted, privacyAccepted) {
    return register(email, password, termsAccepted, privacyAccepted)
  }

  const verifyEmailAddress = useCallback((token) => verifyEmail(token), [])

  async function resendVerificationEmail(email) {
    return resendVerification(email)
  }

  async function sendPasswordReset(email) {
    return requestPasswordReset(email)
  }

  async function changePassword(token, password) {
    return resetPassword(token, password)
  }

  async function signOut() {
    await logout()
    setUser(null)
  }

  return {
    user,
    isLoading,
    loadError,
    signIn,
    signUp,
    signOut,
    verifyEmailAddress,
    resendVerificationEmail,
    sendPasswordReset,
    changePassword,
  }
}
