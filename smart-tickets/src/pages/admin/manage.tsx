"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

type User = {
  _id: string
  email: string
  role: string
  skills?: string
}

export default function ManageUsersPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editData, setEditData] = useState<{ role: string; skills: string }>({ role: "", skills: "" })

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user || user.role !== "admin") {
      router.push("/unauthorized")
    } else {
      setChecking(false)
    }
  }, [router])

  useEffect(() => {
    if (checking) return
    const fetchUsers = async () => {
      try {
        const res = await fetch("https://modmatch-ai.onrender.com/api/auth/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        if (!res.ok) throw new Error("Failed to fetch users")
        const data = await res.json()
        setUsers(data)
      } catch (err) {
        console.error("Error fetching users:", err)
      }
    }

    fetchUsers()
  }, [checking])

  const startEdit = (user: User) => {
    setEditingUserId(user._id)
    setEditData({ role: user.role, skills: user.skills || "" })
  }

  const cancelEdit = () => {
    setEditingUserId(null)
    setEditData({ role: "", skills: "" })
  }

  const saveEdit = async (userId: string) => {
    const user = users.find((u) => u._id === userId)
    if (!user) return

    try {
      const res = await fetch("https://modmatch-ai.onrender.com/api/auth/update-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          email: user.email,
          role: editData.role,
          skills: editData.skills,
        }),
      })
      if (!res.ok) throw new Error("Failed to update user")

      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, role: editData.role, skills: editData.skills } : u
        )
      )
      cancelEdit()
    } catch (err) {
      console.error("Failed to update user:", err)
    }
  }

  if (checking) return null

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Manage Users</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">User Management</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <div
                key={user._id}
                className="bg-white rounded-xl border p-4 shadow-sm"
              >
                <p className="font-medium text-sm text-muted-foreground mb-1">Email</p>
                <p className="mb-2">{user.email}</p>

                <p className="font-medium text-sm text-muted-foreground mb-1">Role</p>
                {editingUserId === user._id ? (
                  <select
                    value={editData.role}
                    onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                    className="w-full border rounded p-2 mb-2"
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                  </select>
                ) : (
                  <p className="mb-2">{user.role}</p>
                )}

                <p className="font-medium text-sm text-muted-foreground mb-1">Skills</p>
                {editingUserId === user._id ? (
                  <textarea
                    value={editData.skills}
                    onChange={(e) => setEditData({ ...editData, skills: e.target.value })}
                    className="w-full border rounded p-2 mb-2"
                  />
                ) : (
                  <p className="mb-2">{user.skills || "-"}</p>
                )}

                <div className="flex gap-2 mt-2">
                  {editingUserId === user._id ? (
                    <>
                      <button
                        onClick={() => saveEdit(user._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-400 text-white px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEdit(user)}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
