"use client";

import Nav from "@/app/components/NavBar";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black text-black dark:text-white font-[family-name:var(--font-geist-sans)]">
      <Nav />
      <main className="pt-20 px-10"> {/* Adjust padding to match header height */}
        <h1 className="text-3xl font-bold mb-6">Welcome to your ERP Dashboard</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Metrics and key data will appear here in future iterations.
        </p>
        <div className="h-[1500px] bg-gradient-to-b from-transparent to-gray-200 dark:to-gray-800">
          {/* Filler for scrolling */}
        </div>
      </main>
    </div>
  );
}
