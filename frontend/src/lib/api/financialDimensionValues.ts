export type DimensionValue = {
  code: string;
  description: string;
};

export async function fetchDimensionValues(dimensionId: number): Promise<DimensionValue[]> {
  const res = await fetch(`http://localhost:8000/api/v1/general_ledger/financial_dimensions/${dimensionId}/values`);
  return res.json();
}

export async function addDimensionValue(dimensionId: number, value: DimensionValue) {
  const res = await fetch(`http://localhost:8000/api/v1/general_ledger/financial_dimensions/${dimensionId}/values`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });
  if (!res.ok) throw new Error("Failed to add value");
}

export async function deleteDimensionValue(dimensionId: number, code: string) {
  const res = await fetch(`http://localhost:8000/api/v1/general_ledger/financial_dimensions/${dimensionId}/values/${code}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete value");
}
