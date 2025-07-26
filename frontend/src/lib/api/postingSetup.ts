export type PostingSetup = {
  module: number;
  type: string;
  accountType: string;
  account: string;
};

/**
 * fetchPostingSetup - Gets list of posting setups.
 * @returns list of posting setups.
 */
export async function fetchPostingSetup(): Promise<PostingSetup[]> {
  const res = await fetch("http://localhost:8000/api/v1/general_ledger/posting_setup", {
    credentials: "include", // if using cookies/auth
  });

  if (!res.ok) {
    throw new Error("Failed to fetch posting setup");
  }

  return res.json();
}
