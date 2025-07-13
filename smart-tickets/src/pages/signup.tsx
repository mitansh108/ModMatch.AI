"use client"

import { useState } from "react"
import { useRouter } from "next/router"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Head from "next/head"


export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("user") // default to user
  const [error, setError] = useState("")


  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const res = await fetch(`https://modmatch-ai.onrender.com/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Signup failed")
        return
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      router.push("/dashboard")
    } catch (err) {
      console.error("Signup error:", err)
      setError("Something went wrong")
    }
  }

  return (
    <>
      <Head>
        <title>Sign Up – ModMatch</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-100 px-4">
        <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
            <p className="text-gray-500 text-sm mt-1">Join ModMatch and start learning smarter</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label className="text-sm">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-gray-800"
            >
              Sign Up
            </Button>
          </form>

          <div className="text-center text-sm text-gray-500 space-y-1">
            <p>
              Already have an account?{" "}
              <a href="/login" className="underline text-black hover:text-gray-800">
                Login
              </a>
            </p>
            <p>
              <a href="/" className="underline text-gray-500 hover:text-black">
                Return to Homepage
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
