'use client'

import WebApp from '@twa-dev/sdk'
import { useEffect, useState } from 'react'

// Define the interface for user data
interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    // Check if `window` is available to prevent issues with SSR
    if (typeof window !== 'undefined' && WebApp.initDataUnsafe?.user) {
      setUserData(WebApp.initDataUnsafe.user as UserData)
    }
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-white text-black">
      {userData ? (
        <>
          <h1 className="text-2xl font-bold mb-4">Hello Grishka!</h1>
          <ul>
            <li>ID: {userData.id}</li>
            <li>First Name: {userData.first_name}</li>
            <li>Last Name: {userData.last_name || 'N/A'}</li>
            <li>Username: {userData.username || 'N/A'}</li>
            <li>Language Code: {userData.language_code}</li>
            <li>Is Premium: {userData.is_premium ? 'Yes' : 'No'}</li>
          </ul>
          <img src="https://raw.githubusercontent.com/j2thex/jump-super-farm-repo/refs/heads/main/logo.png" alt="Fun Placeholder" className="rounded-full border border-gray-300" />
        </>
      ) : (
        <div>Loading...</div>
      )}
    </main>
  )
}