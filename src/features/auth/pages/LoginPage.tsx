import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import config from '../../../config'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)

  async function handleLogin() {
    setIsSigningIn(true)
    setMessage('')

    try {
      const response = await axios.post(
        `${config.apiBaseUrl}/tiservice/session/login`,
        { username, password },
        { withCredentials: true }
      )

      if (response.status === 200 && response.data === 'SUCCESS_NEWLOGIN') {
        setMessage('Login successful!')
        navigate('/worklist')
      } else {
        setMessage('Invalid Credentials')
      }

    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const errorMessage = error.response.data

        if (errorMessage === 'ERROR_USER') {
          setMessage('User not found')
        } else if (errorMessage === 'ERROR_PASSWORD') {
          setMessage('Incorrect password')
        } else if (errorMessage === 'ERROR_STATUS') {
          setMessage('User Inactive')
        } else {
          setMessage('Invalid Credentials')
        }
      } else {
        setMessage('Error during login')
        console.error(error)
      }
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1>Login</h1>

        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
        />

        {message && <p>{message}</p>}

        <button
          type="button"
          onClick={handleLogin}
          disabled={isSigningIn}
        >
          {isSigningIn ? 'Signing in...' : 'Login'}
        </button>
      </section>
    </main>
  )
}