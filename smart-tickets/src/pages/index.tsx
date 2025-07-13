"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Head from "next/head"
import { motion } from "framer-motion"
import Link from "next/link"

export default function Home() {
  return (
    <>
      <Head>
        <title>ModMatch – AI-Powered Ticket Assignment</title>
      </Head>

      <div className="min-h-screen bg-white text-black font-sans">
        {/* Navbar */}
        <header className="flex items-center justify-between px-6 py-4 border-b shadow-sm">
          <div className="text-xl font-bold">ModMatch</div>
          <div className="flex gap-4">
  <Link href="/login">
    <Button
      variant="outline"
      className="border-black text-black hover:bg-black hover:text-white"
    >
      Login
    </Button>
  </Link>

  <Link href="/signup">
    <Button className="bg-black text-white hover:bg-gray-800">
      Sign up
    </Button>
  </Link>
</div>
        </header>

        {/* Hero Section */}
        <main className="flex flex-col-reverse lg:flex-row items-center justify-between px-6 lg:px-20 py-16 gap-12 bg-white text-black">
          {/* Left: Text */}
          <motion.div
            className="max-w-xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm uppercase text-gray-500 mb-2">AI-Powered Ticketing</p>
<h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
  Say Goodbye to Ticket Overload!
</h1>
<p className="text-lg text-gray-700 mb-6">
  ModMatch auto-prioritizes and routes tickets to the best-fit moderator, turning support chaos into clarity.
</p>

            <div className="flex flex-wrap gap-4">
             
            </div>
          </motion.div>

          {/* Right: Mockup Image */}
          <motion.div
            className="flex-shrink-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <Image
  src="/user.png"
  alt="App Screenshot"
  width={900}
  height={500}
  className="rounded-xl shadow-lg"
/>

          </motion.div>

        </main>

       {/* Sliding Banner */}
<section className="overflow-hidden bg-white py-4 border-t border-b">
  <motion.div
    className="flex whitespace-nowrap gap-16 text-black text-lg font-semibold tracking-wide px-4"
    animate={{ x: ["20%", "-50%"] }}
    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
  >
    <span>⚡ AI-Powered Ticket Assignment</span>
    <span>🚀 No More Manual Routing</span>
    <span>🧠 Smart Moderator Matching</span>
    <span>📩 Real-Time Notifications</span>
    <span>⚡ AI-Powered Ticket Assignment</span>
    <span>🚀 No More Manual Routing</span>
  </motion.div>
</section>


       {/* How It Works Section */}
       <section className="bg-white py-20 px-6 lg:px-20">
          <motion.div
            className="max-w-6xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4 text-black">How ModMatch Works</h2>
            <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
              Every ticket goes through a smart pipeline: enriched, analyzed by AI, and routed to the best moderator.
            </p>

            <div className="grid gap-8 md:grid-cols-3 text-left">
              <motion.div
                className="bg-[#f1f5f9] p-6 rounded-lg shadow hover:shadow-md transition"
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-xl font-bold mb-2 text-black">1. Ticket Created</h3>
                <p className="text-gray-700">A user submits a support request with details.</p>
              </motion.div>
              <motion.div
                className="bg-[#f1f5f9] p-6 rounded-lg shadow hover:shadow-md transition"
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-xl font-bold mb-2 text-black">2. AI Enrichment</h3>
                <p className="text-gray-700">We extract skills, priority, and add helpful summaries automatically.</p>
              </motion.div>
              <motion.div
                className="bg-[#f1f5f9] p-6 rounded-lg shadow hover:shadow-md transition"
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-xl font-bold mb-2 text-black">3. Smart Assignment</h3>
                <p className="text-gray-700">We match it to a moderator based on expertise. No delays.</p>
              </motion.div>
            </div>
          </motion.div>
        </section>


        {/* Comparison Table */}
        <section className="bg-[#f9f9ff] py-16 px-6 lg:px-20">
          <motion.div
            className="max-w-6xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">Why teams prefer ModMatch</h2>
            <p className="text-gray-600 mb-12">
              Unlike manual support routing or rigid ticket systems, ModMatch uses AI to make everything smoother.
            </p>

            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-left rounded-md overflow-hidden shadow-md bg-white">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-lg">Feature</th>
                    <th className="px-6 py-4 font-semibold text-lg">ModMatch</th>
                    <th className="px-6 py-4 font-semibold text-lg">Manual Routing</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  <tr className="border-b border-gray-200">
                    <td className="px-6 py-4 font-medium">AI-powered ticket assignment</td>
                    <td className="px-6 py-4 text-green-600">✔️</td>
                    <td className="px-6 py-4 text-red-500">❌</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-6 py-4 font-medium">Skill-based moderator matching</td>
                    <td className="px-6 py-4 text-green-600">✔️</td>
                    <td className="px-6 py-4 text-red-500">❌</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-6 py-4 font-medium">AI-generated helpful notes</td>
                    <td className="px-6 py-4 text-green-600">✔️</td>
                    <td className="px-6 py-4 text-red-500">❌</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-6 py-4 font-medium">Email + dashboard notifications</td>
                    <td className="px-6 py-4 text-green-600">✔️</td>
                    <td className="px-6 py-4 text-yellow-600">⚠️</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">Scales with your team automatically</td>
                    <td className="px-6 py-4 text-green-600">✔️</td>
                    <td className="px-6 py-4 text-red-500">❌</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </section>

        
        {/* CTA Footer */}
        <footer className="bg-black text-white py-16 px-6 lg:px-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">See ModMatch in action</h2>
            <p className="text-lg text-gray-300 mb-8">
              Experience how AI can instantly improve your support team’s performance.
            </p>
            <Button className="bg-white text-black hover:bg-gray-100 font-semibold px-6 py-3">
              Start your free trial
            </Button>
          </motion.div>
        </footer>
      </div>
    </>
  )
}