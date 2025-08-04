from app.api.v1.shared.addresses.schemas import ( Address )

# Sequence stores
_sequence_store = {"GJ": 8, "PO": 0}
_record_store = {"Inventory": 5, "InventoryDimensions": 5, "Address": 3, "Warehouse": 3, "Location": 4}

# Shared Data
_address_book: list[Address] = [
    Address(street="123 Main St.", city="Sacramento", state="CA", zip="95628", record=1),
    Address(street="456 Warehouse Rd.", city="Tahoe", state="CA", zip="50050", record=2),
    Address(street="789 Dist Ct.", city="San Francisco", state="CA", zip="50051", record=3),
]