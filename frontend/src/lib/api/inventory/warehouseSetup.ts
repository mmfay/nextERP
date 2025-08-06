export type Location = {
  locationID: string;
  type: string;
  active: number;
  warehouse: number;
  record: number;
};

export type WarehousesWithLocations = {
  warehouseID: string;
  warehouseName: string;
  record: number;
  locationList: Location[];
};

export async function fetchWarehouseSetup(): Promise<WarehousesWithLocations[]> {
  const res = await fetch("http://localhost:8000/api/v1/inventory/warehouse_setup");
  if (!res.ok) {
    throw new Error("Failed to fetch warehouse setup");
  }
  return res.json();
}

export async function createWarehouse(data: { warehouseID: string; warehouseName: string; addressRecord: number;}) {
  const res = await fetch("http://localhost:8000/api/v1/inventory/warehouse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create warehouse");
  return res.json();
}

export async function createLocation(data: { locationID: string; type: string; active: number; warehouse: number; }) {
  console.log(data);
  const res = await fetch("http://localhost:8000/api/v1/inventory/location", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create location");
  return res.json();
}

export async function updateLocationStatus(record: number, active: number) {
  const res = await fetch("http://localhost:8000/api/v1/inventory/location", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ record, active }),
  });
  if (!res.ok) throw new Error("Failed to update location");
  return res.json();
}

export async function updateWarehouse(data: {
  record: number;
  warehouseID: string;
  warehouseName: string;
  addressRecord: number;
}) {
  const res = await fetch("http://localhost:8000/api/v1/inventory/warehouse", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update warehouse");
  }

  return res.json();
}
