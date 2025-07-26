export type PostingSetup = {
  module: number;
  type: string;
  accountType: string;
  account: string;
};

const BASE_URL = "http://localhost:8000/api/v1/general_ledger/";

/**
 * fetchPostingSetup - Gets list of posting setups.
 * @returns list of posting setups.
 */
export async function fetchPostingSetup(): Promise<PostingSetup[]> {
  const res = await fetch(`${BASE_URL}posting_setup`, {
    credentials: "include", // if using cookies/auth
  });

  if (!res.ok) {
    throw new Error("Failed to fetch posting setup");
  }

  return res.json();
}


/**
 * updatePostingSetup - Sends updated posting setup records to backend.
 * @param updates array of PostingSetup records that need to be updated.
 */
export async function updatePostingSetup(
  updates: PostingSetup[]
): Promise<PostingSetup[]> {
  const res = await fetch(`${BASE_URL}posting_setup`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`Failed to update posting setup: ${res.status} - ${message}`);
  }

  return res.json(); // assuming it returns updated list
}