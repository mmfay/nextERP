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
  locationList: Location[];
};

export async function fetchWarehouseSetup(): Promise<WarehousesWithLocations[]> {
  const res = await fetch("http://localhost:8000/api/v1/inventory/warehouse_setup");
  if (!res.ok) {
    throw new Error("Failed to fetch warehouse setup");
  }
  return res.json();
}
