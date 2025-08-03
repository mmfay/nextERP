"use client";

import { useEffect, useState } from "react";
import { fetchWarehouseSetup } from "@/lib/api/inventory/warehouseSetup";

const addresses = [
  "123 Main St, Sacramento, CA",
  "456 Warehouse Rd, Reno, NV",
  "789 Distribution Ln, Fresno, CA",
];

type Location = {
  code: string;
  type: string;
  active: boolean;
};

type Warehouse = {
  code: string;
  name: string;
  address: string;
  locations: Location[];
};

export default function WarehouseSetupPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseCode, setSelectedWarehouseCode] = useState<string | null>(null);
  const [editWarehouse, setEditWarehouse] = useState<{ code: string; name: string; address: string } | null>(null);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newLocation, setNewLocation] = useState<{ code: string; type: string; active: boolean }>({ code: "", type: "", active: true });

  useEffect(() => {
    fetchWarehouseSetup()
      .then((data) => {
        const transformed: Warehouse[] = data.map((wh: any, i: number) => ({
          code: wh.warehouseID,
          name: wh.warehouseName,
          address: addresses[i % addresses.length],
          locations: wh.locationList.map((loc: any) => ({
            code: loc.locationID,
            type: loc.type,
            active: loc.active === 1,
          })),
        }));
        setWarehouses(transformed);
        setSelectedWarehouseCode(transformed[0]?.code || null);
      })
      .catch((err) => console.error("Failed to load warehouse data:", err));
  }, []);

  const selectedWarehouse = warehouses.find((wh) => wh.code === selectedWarehouseCode);

  const handleWarehouseEdit = () => {
    if (selectedWarehouse) {
      setEditWarehouse({
        code: selectedWarehouse.code,
        name: selectedWarehouse.name,
        address: selectedWarehouse.address,
      });
      setShowWarehouseModal(true);
    }
  };

  const handleWarehouseSave = () => {
    setWarehouses((prev) =>
      prev.map((wh) =>
        wh.code === editWarehouse?.code ? { ...wh, ...editWarehouse } : wh
      )
    );
    setShowWarehouseModal(false);
  };

  const handleLocationSave = () => {
    if (!selectedWarehouseCode || !newLocation.code || !newLocation.type) return;

    setWarehouses((prev) =>
      prev.map((wh) =>
        wh.code === selectedWarehouseCode
          ? {
              ...wh,
              locations: [...wh.locations, newLocation],
            }
          : wh
      )
    );
    setNewLocation({ code: "", type: "", active: true });
    setShowLocationModal(false);
  };

  const toggleLocationActive = (locCode: string) => {
    setWarehouses((prev) =>
      prev.map((wh) => {
        if (wh.code !== selectedWarehouseCode) return wh;
        return {
          ...wh,
          locations: wh.locations.map((loc) =>
            loc.code === locCode
              ? { ...loc, active: !loc.active }
              : loc
          ),
        };
      })
    );
  };

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-16">
      <h1 className="text-2xl font-bold mb-6 text-center">Warehouse & Location Setup</h1>

      <div className="flex justify-between mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
          onClick={() => {
            setEditWarehouse({ code: "", name: "", address: addresses[0] });
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
              <p><span className="font-medium">Address:</span> {selectedWarehouse.address}</p>
            </>
          ) : (
            <p>Select a warehouse to see details.</p>
          )}
        </div>

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
                value={editWarehouse?.address || ''}
                onChange={(e) =>
                  setEditWarehouse((prev) => ({ ...prev!, address: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded"
              >
                {addresses.map((addr, idx) => (
                  <option key={idx} value={addr}>{addr}</option>
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
