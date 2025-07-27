export type InventoryValue = {
  item: string;
  warehouse: string;
  aisle: string;
  location: string;
  valuePhysical: Number;
  valueFinancial: Number;
  qtyPhysical: Number;
};

/**
 * fetchMainAccounts - Gets list of main accounts.
 * @returns list of main accounts
 */
export async function fetchInventoryValue(): Promise<InventoryValue[]> {
  const res = await fetch("http://localhost:8000/api/v1/inventory/inventory_value", {
    credentials: "include", // if using cookies/auth
  });

  if (!res.ok) {
    throw new Error("Failed to fetch main accounts");
  }

  return res.json();
}