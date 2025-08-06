"use client";

import { useEffect, useState } from "react";
import {
  fetchWarehouseSetup,
  createLocation,
  createWarehouse,
  updateLocationStatus,
  updateWarehouse
} from "@/lib/api/inventory/warehouseSetup";
import { fetchAddresses } from "@/lib/api/shared/addresses/addresses";

type Location = {
  code: string;
  type: string;
  active: boolean;
};

type Address = {
  street: string;
  city: string;
  state: string;
  zip: string;
  record: number;
};

type DisplayWarehouse = {
  code: string;
  name: string;
  record: number;
  address: Address | null;
  locations: Location[];
};

export default function WarehouseSetupPage() {
  const [warehouses, setWarehouses] = useState<DisplayWarehouse[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedWarehouseCode, setSelectedWarehouseCode] = useState<string | null>(null);
  const [editWarehouse, setEditWarehouse] = useState<{ code: string; name: string; addressRecord: number; record?: number } | null>(null);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newLocation, setNewLocation] = useState<{ code: string; type: string; active: boolean }>({ code: "", type: "", active: true });

  useEffect(() => {
    Promise.all([fetchWarehouseSetup(), fetchAddresses()])
      .then(([warehouseData, addressData]) => {
        setAddresses(addressData);
        const transformed = transformWarehouseData(warehouseData);
        setWarehouses(transformed);
        setSelectedWarehouseCode(transformed[0]?.code || null);
      })
      .catch((err) => console.error("Failed to load warehouse or address data:", err));
  }, []);

  const transformWarehouseData = (warehouseData: any[]): DisplayWarehouse[] =>
    warehouseData.map((wh) => ({
      code: wh.warehouseID,
      name: wh.warehouseName,
      record: wh.record,
      address: wh.address || null,
      locations: Array.isArray(wh.locationList)
        ? wh.locationList.map((loc: any) => ({
            code: loc.locationID,
            type: loc.type,
            active: loc.active === 1,
          }))
        : [],
    }));

  const selectedWarehouse = warehouses.find((wh) => wh.code === selectedWarehouseCode);

  const handleWarehouseEdit = () => {
    if (selectedWarehouse) {
      setEditWarehouse({
        code: selectedWarehouse.code,
        name: selectedWarehouse.name,
        addressRecord: selectedWarehouse.address?.record || addresses[0]?.record || 0,
        record: selectedWarehouse.record,
      });
      setShowWarehouseModal(true);
    }
  };

const handleWarehouseSave = async () => {
  if (!editWarehouse) return;
  
  try {
    if (editWarehouse.record !== undefined) {
      // update
      await updateWarehouse({
        record: editWarehouse.record,
        warehouseID: editWarehouse.code,
        warehouseName: editWarehouse.name,
        addressRecord: editWarehouse.addressRecord,
      });
    } else {
      // create
      await createWarehouse({
        warehouseID: editWarehouse.code,
        warehouseName: editWarehouse.name,
        addressRecord: editWarehouse.addressRecord,
      });
    }

    const updatedWarehouses = await fetchWarehouseSetup();
    const transformed = transformWarehouseData(updatedWarehouses);
    setWarehouses(transformed);
    setSelectedWarehouseCode(editWarehouse.code);
  } catch (err) {
    console.error("Failed to save warehouse:", err);
  } finally {
    setShowWarehouseModal(false);
  }
};


  const handleLocationSave = async () => {
    const wh = warehouses.find((w) => w.code === selectedWarehouseCode);
    console.log(JSON.stringify(wh));

    if (!wh || !newLocation.code || !newLocation.type || typeof wh.record !== "number") {
      console.warn("Missing warehouse or invalid data for location creation");
      return;
    }
    try {
      await createLocation({
        locationID: newLocation.code,
        type: newLocation.type,
        active: newLocation.active ? 1 : 0,
        warehouse: wh.record,
      });
      const updatedWarehouses = await fetchWarehouseSetup();
      setWarehouses(transformWarehouseData(updatedWarehouses));
    } catch (err) {
      console.error("Failed to create location:", err);
    } finally {
      setNewLocation({ code: "", type: "", active: true });
      setShowLocationModal(false);
    }
  };

  const toggleLocationActive = async (locCode: string) => {
    const wh = warehouses.find((w) => w.code === selectedWarehouseCode);
    if (!wh) return;
    const loc = wh.locations.find((l) => l.code === locCode);
    if (!loc) return;
    try {
      const updatedWarehouses = await fetchWarehouseSetup();
      const backendLoc = updatedWarehouses
        .flatMap((wh: any) => wh.locationList)
        .find((l: any) => l.locationID === loc.code);
      if (!backendLoc) throw new Error("Backend location not found");
      await updateLocationStatus(backendLoc.record, loc.active ? 0 : 1);
      setWarehouses(transformWarehouseData(await fetchWarehouseSetup()));
    } catch (err) {
      console.error("Failed to toggle location status:", err);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-16">
      <h1 className="text-2xl font-bold mb-6 text-center">Warehouse & Location Setup</h1>

      <div className="flex justify-between mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
          onClick={() => {
            setEditWarehouse({ code: "", name: "", addressRecord: addresses[0]?.record || 0 });
            setShowWarehouseModal(true);
          }}
        >
          + Add Warehouse
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-md"
          onClick={() => setShowLocationModal(true)}
        >
          + Add Location
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Warehouse list */}
        <div className="border rounded-md overflow-hidden">
          <h2 className="bg-gray-100 dark:bg-gray-800 p-3 font-semibold">Warehouses</h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {warehouses.map((wh) => (
              <li
                key={wh.code}
                className={`p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  selectedWarehouseCode === wh.code ? "bg-blue-100 dark:bg-blue-900" : ""
                }`}
                onClick={() => setSelectedWarehouseCode(wh.code)}
              >
                {wh.name} ({wh.code})
              </li>
            ))}
          </ul>
        </div>

        {/* Warehouse detail panel */}
        <div className="border rounded-md p-4">
          {selectedWarehouse ? (
            <>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">{selectedWarehouse.name}</h2>
                <button
                  className="text-blue-600 underline"
                  onClick={handleWarehouseEdit}
                >
                  Edit
                </button>
              </div>
              <p><span className="font-medium">Code:</span> {selectedWarehouse.code}</p>
              {selectedWarehouse.address ? (
                <p>
                  <span className="font-medium">Address:</span>{" "}
                  {selectedWarehouse.address.street}, {selectedWarehouse.address.city}, {selectedWarehouse.address.state} {selectedWarehouse.address.zip}
                </p>
              ) : (
                <p><span className="font-medium">Address:</span> Not Assigned</p>
              )}
            </>
          ) : (
            <p>Select a warehouse to see details.</p>
          )}
        </div>

        {/* Locations table */}
        <div className="border rounded-md overflow-x-auto">
          <h2 className="bg-gray-100 dark:bg-gray-800 p-3 font-semibold">Locations</h2>
          {selectedWarehouse && selectedWarehouse.locations.length > 0 ? (
            <table className="min-w-full table-auto">
              <thead className="bg-gray-200 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Code</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Active</th>
                </tr>
              </thead>
              <tbody>
                {selectedWarehouse.locations.map((loc) => (
                  <tr key={loc.code} className="border-t dark:border-gray-700">
                    <td className="px-4 py-2">{loc.code}</td>
                    <td className="px-4 py-2">{loc.type}</td>
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={loc.active}
                        onChange={() => toggleLocationActive(loc.code)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-4">No locations found for this warehouse.</p>
          )}
        </div>
      </div>

      {/* Warehouse modal */}
      {showWarehouseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">{editWarehouse?.code ? 'Edit Warehouse' : 'Add Warehouse'}</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Code"
                value={editWarehouse?.code || ''}
                onChange={(e) =>
                  setEditWarehouse((prev) => ({ ...prev!, code: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Name"
                value={editWarehouse?.name || ''}
                onChange={(e) =>
                  setEditWarehouse((prev) => ({ ...prev!, name: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded"
              />
              <select
                value={editWarehouse?.addressRecord || ''}
                onChange={(e) =>
                  setEditWarehouse((prev) => ({
                    ...prev!,
                    addressRecord: parseInt(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border rounded"
              >
                {addresses.map((addr) => (
                  <option key={addr.record} value={addr.record}>
                    {addr.street}, {addr.city}, {addr.state} {addr.zip}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button onClick={() => setShowWarehouseModal(false)} className="px-4 py-2 bg-gray-300 rounded">
                Cancel
              </button>
              <button onClick={handleWarehouseSave} className="px-4 py-2 bg-blue-600 text-white rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add Location</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Code"
                value={newLocation.code}
                onChange={(e) => setNewLocation((prev) => ({ ...prev, code: e.target.value }))}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Type"
                value={newLocation.type}
                onChange={(e) => setNewLocation((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border rounded"
              />
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newLocation.active}
                  onChange={(e) => setNewLocation((prev) => ({ ...prev, active: e.target.checked }))}
                />
                <span>Active</span>
              </label>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button onClick={() => setShowLocationModal(false)} className="px-4 py-2 bg-gray-300 rounded">
                Cancel
              </button>
              <button onClick={handleLocationSave} className="px-4 py-2 bg-green-600 text-white rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
