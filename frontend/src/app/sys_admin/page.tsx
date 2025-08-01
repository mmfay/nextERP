"use client";

import { useRouter } from "next/navigation";
import { SecureButton } from "@/app/components/SecureButton";
import { Permissions } from "@/app/config/permissions";

export default function SystemAdminPage() {

  const router = useRouter();

  return (
    <div className="min-h-screen bg-inherit text-inherit font-[family-name:var(--font-geist-sans)]">
      <main className="pt-24 px-8 sm:px-16 space-y-10">
        {/* Page Heading */}
        <section>
          <h1 className="text-4xl font-bold mb-2">System Administrations</h1>
          <p className="text-gray-700 dark:text-gray-400">
            Access and configure system behavior.
          </p>
        </section>

        {/* Reports Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Reports</h2>
          <div className="flex flex-wrap gap-4">
            <SecureButton
              permission={Permissions.MOD_SYSADMIN}
              onClick={() => router.push("/sys_admin/users")}
              className="px-6 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              Users
            </SecureButton>
            <SecureButton
              permission={Permissions.MOD_SYSADMIN}
              onClick={() => router.push("/sys_admin/permissions")}
              className="px-6 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              Permissions
            </SecureButton>
          </div>
        </section>

        {/* Journals Section */}
        <section>
          {/*<h2 className="text-2xl font-semibold mb-4">Journals</h2>*/}
          <div className="flex flex-wrap gap-4">
          </div>
        </section>

        {/* Setup Section */}
        <section>
          {/*<h2 className="text-2xl font-semibold mb-4">Setup</h2>*/}
          <div className="flex flex-wrap gap-4">
          </div>
        </section>
      </main>
    </div>
  );
}
