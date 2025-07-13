"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function UserSettingsPage() {
  const [user, setUser] = useState({ name: "", email: "" })
  const [darkMode, setDarkMode] = useState(false)
  const [emailNotif, setEmailNotif] = useState(true)

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
    setUser({ name: storedUser.name || "", email: storedUser.email || "" })
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <h2 className="text-xl font-semibold">User Settings</h2>
        </header>

        <main className="p-6 space-y-10">
          {/* Profile Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium">Profile</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Name</Label>
                <Input value={user.name} readOnly />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={user.email} readOnly />
              </div>
            </div>
          </section>

          <Separator />

          {/* Change Password */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium">Change Password</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Current Password</Label>
                <Input type="password" />
              </div>
              <div>
                <Label>New Password</Label>
                <Input type="password" />
              </div>
              <div>
                <Label>Confirm New Password</Label>
                <Input type="password" />
              </div>
            </div>
            <Button>Update Password</Button>
          </section>

          <Separator />

          {/* Notifications */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium">Notifications</h3>
            <div className="flex items-center justify-between">
              <Label>Email Notifications</Label>
              <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
            </div>
          </section>

          <Separator />

          {/* Preferences */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium">Preferences</h3>
            <div className="flex items-center justify-between">
              <Label>Dark Mode</Label>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
          </section>

          <Separator />

          {/* Danger Zone */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
            <Button variant="destructive">Delete Account</Button>
          </section>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
