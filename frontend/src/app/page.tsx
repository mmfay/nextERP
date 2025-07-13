"use client";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-inherit text-inherit font-[family-name:var(--font-geist-sans)]">
      <main className="pt-24 px-8 sm:px-16 space-y-10">
        {/* Page Heading */}
        <section>
          <h1 className="text-4xl font-bold mb-2">ERP Dashboard</h1>
          <p className="text-gray-700 dark:text-gray-400">
            Metrics and key data will appear here in future iterations.
          </p>
        </section>

        {/* Temporary filler to test scrolling behavior */}
        <section>
          <div className="h-[1500px] bg-gradient-to-b from-transparent to-gray-200 dark:to-gray-800 rounded-md" />
        </section>
      </main>
    </div>
  );
}
