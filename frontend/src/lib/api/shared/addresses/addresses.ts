// Typescript types for address records

export type Address = {
  street: string;
  city: string;
  state: string;
  zip: string;
  record: number;
};

// If you still want to keep WarehousesWithLocations, you can keep it separate
// But for this dataset, we return Address[] not WarehousesWithLocations[]

export async function fetchAddresses(): Promise<Address[]> {
  const res = await fetch("http://localhost:8000/api/v1/shared/addresses/addressList");
  if (!res.ok) {
    throw new Error("Failed to fetch address list");
  }
  return res.json();
}
