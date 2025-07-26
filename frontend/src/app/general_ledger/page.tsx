"use client";

import { useRouter } from "next/navigation";
import { SecureButton } from "@/app/components/SecureButton";
import { Permissions } from "@/app/config/permissions";

export default function GeneralLedgerPage() {

  const router = useRouter();

  return (
    <div className="min-h-screen bg-inherit text-inherit font-[family-name:var(--font-geist-sans)]">
      <main className="pt-24 px-8 sm:px-16 space-y-10">
        {/* Page Heading */}
        <section>
          <h1 className="text-4xl font-bold mb-2">General Ledger</h1>
          <p className="text-gray-700 dark:text-gray-400">
            Access financial data and configure ledger behavior.
          </p>
        </section>

        {/* Reports Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Reports</h2>
          <div className="flex flex-wrap gap-4">
            <SecureButton
              permission={Permissions.MOD_GL}
              onClick={() => router.push("/general_ledger/trial_balance")}
              className="px-6 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              Trial Balance
            </SecureButton>
            {/*
            <SecureButton
              permission={Permissions.MOD_GL}
              onClick={() => console.log("Go to Balance Sheet")}
              className="px-6 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              Balance Sheet
            </SecureButton>
            <SecureButton
              permission={Permissions.MOD_GL}
              onClick={() => console.log("Go to Income Statement")}
              className="px-6 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              Income Statement
            </SecureButton>
            <SecureButton
              permission={Permissions.MOD_GL}
              onClick={() => console.log("Go to Journal Entries")}
              className="px-6 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              Journal Entries
            </SecureButton>
            */}
          </div>
        </section>

        {/* Journals Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Journals</h2>
          <div className="flex flex-wrap gap-4">
            <SecureButton
              permission={Permissions.MOD_GL}
              onClick={() => router.push("/general_ledger/general_journal")}
              className="px-6 py-3 rounded-md bg-green-600 hover:bg-green-700 text-white transition"
            >
              General Journal
            </SecureButton>
            {/*
            <SecureButton
              permission={Permissions.MOD_GL}
              onClick={() => console.log("Create Intercompany Journal")}
              className="px-6 py-3 rounded-md bg-green-600 hover:bg-green-700 text-white transition"
            >
              Intercompany Journal
            </SecureButton>
            <SecureButton
              permission={Permissions.MOD_GL}
              onClick={() => console.log("Create Allocation Journal")}
              className="px-6 py-3 rounded-md bg-green-600 hover:bg-green-700 text-white transition"
            >
              Allocation Journal
            </SecureButton>
            <SecureButton
              permission={Permissions.MOD_GL}
              onClick={() => console.log("Create Accrual Journal")}
              className="px-6 py-3 rounded-md bg-green-600 hover:bg-green-700 text-white transition"
            >
              Accrual Journal
            </SecureButton>
            <SecureButton
              permission={Permissions.MOD_GL}
              onClick={() => console.log("Create Reversing Entry")}
              className="px-6 py-3 rounded-md bg-green-600 hover:bg-green-700 text-white transition"
            >
              Reversing Entry
            </SecureButton>
            */}
          </div>
        </section>

        {/* Setup Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Setup</h2>
          <div className="flex flex-wrap gap-4">
            {/*
            <SecureButton
              permission={Permissions.SETUP_GL}
              onClick={() => console.log("Configure Workflows")}
              className="px-6 py-3 rounded-md bg-gray-800 hover:bg-gray-700 text-white transition"
            >
              Workflows
            </SecureButton>
             */}
            <SecureButton
              permission={Permissions.SETUP_GL}
              onClick={() => router.push("/general_ledger/configure_account_structures")}
              className="px-6 py-3 rounded-md bg-gray-800 hover:bg-gray-700 text-white transition"
            >
              Configure Account Structures
            </SecureButton>
            <SecureButton
              permission={Permissions.SETUP_GL}
              onClick={() => router.push("/general_ledger/main_accounts")}
              className="px-6 py-3 rounded-md bg-gray-800 hover:bg-gray-700 text-white transition"
            >
              Main Accounts
            </SecureButton>
            <SecureButton
              permission={Permissions.SETUP_GL}
              onClick={() => router.push("/general_ledger/financial_dimensions")}
              className="px-6 py-3 rounded-md bg-gray-800 hover:bg-gray-700 text-white transition"
            >
              Financial Dimensions
            </SecureButton>
            <SecureButton
              permission={Permissions.SETUP_GL}
              onClick={() => router.push("/general_ledger/posting")}
              className="px-6 py-3 rounded-md bg-gray-800 hover:bg-gray-700 text-white transition"
            >
              Posting
            </SecureButton>
          </div>
        </section>
      </main>
    </div>
  );
}
