"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { SecureButton } from "@/app/components/SecureButton";
import { Permissions } from "@/app/config/permissions";

export default function Nav() {
  const router = useRouter();
  const [showModules, setShowModules] = useState(false);

  const handleLogout = async () => {
    await fetch("http://localhost:8000/api/v1/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-4 shadow-md bg-white dark:bg-gray-900">
      <div className="flex items-center gap-4">
        <Image
          src="/next.svg"
          alt="ERP Logo"
          width={120}
          height={30}
          className="dark:invert"
        />

        {/* Modules Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowModules(!showModules)}
            className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Modules ▾
          </button>
          {showModules && (
            <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md z-10">
                <a
                    href="/"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    Dashboard
                </a>
                <a
                    href="/general_ledger"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    General Ledger
                </a>
                <a
                    href="/purchasing"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    Purchasing
                </a>
                <a
                    href="/sales"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    Sales
                </a>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <SecureButton
          permission={Permissions.BASE}
          onClick={() => router.push("/settings")}
          className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition"
        >
          User Settings
        </SecureButton>

        <SecureButton
          permission={Permissions.BASE}
          onClick={handleLogout}
          className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition"
        >
          Logout
        </SecureButton>
      </div>
    </nav>
  );
}
