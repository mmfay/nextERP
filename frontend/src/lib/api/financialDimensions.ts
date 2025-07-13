// lib/api/financialDimensions.ts

export type FinancialDimension = {
  id: number;
  name: string;
  in_use: boolean;
};

export async function fetchFinancialDimensions(): Promise<FinancialDimension[]> {
  const res = await fetch("http://localhost:8000/api/v1/general_ledger/financial_dimensions", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch financial dimensions");
  return res.json();
}

export async function updateFinancialDimension(data: FinancialDimension): Promise<FinancialDimension> {
  const res = await fetch("http://localhost:8000/api/v1/general_ledger/financial_dimensions", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update dimension");
  return res.json();
}
