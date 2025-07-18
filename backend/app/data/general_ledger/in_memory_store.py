from app.api.v1.general_ledger.schemas import (
    MainAccount, 
    CreateMainAccount, 
    FinancialDimension, 
    UpdateFinancialDimension, 
    DimensionValue,
    AccountCombination,
    AccountCombinationRequest,
    GLEntry,
    TrialBalanceEntry,
    SubledgerEntry,
    GeneralJournal,
    JournalLine
)
from datetime import datetime, date
from uuid import uuid4

# In-memory store (can be replaced with DB later)
_main_accounts: list[MainAccount] = [
    MainAccount(account="1000", description="Cash", type="Asset"),
    MainAccount(account="2000", description="Accounts Payable", type="Liability"),
    MainAccount(account="3000", description="Retained Earnings", type="Equity"),
    MainAccount(account="4000", description="Sales Revenue", type="Revenue"),
    MainAccount(account="5000", description="Cost of Goods Sold", type="Expense"),
]

_financial_dimensions: list[FinancialDimension] = [
    FinancialDimension(id=1, name="Department", in_use=True),
    FinancialDimension(id=2, name="Cost Center", in_use=True),
    FinancialDimension(id=3, name="", in_use=False),
    FinancialDimension(id=4, name="Project", in_use=True),
    FinancialDimension(id=5, name="", in_use=False),
    FinancialDimension(id=6, name="", in_use=False),
    FinancialDimension(id=7, name="", in_use=False),
    FinancialDimension(id=8, name="Region", in_use=True),
]

_dimension_values: dict[int, list[DimensionValue]] = {
    1: [DimensionValue(code="01", description="Marketing"), DimensionValue(code="02", description="Finance")],
    2: [DimensionValue(code="100", description="West Coast"), DimensionValue(code="200", description="East Coast")],
    8: [DimensionValue(code="01", description="Northwest"), DimensionValue(code="02", description="Southwest")],
}

_account_combinations: dict[str, list[AccountCombination]] = {
    "4000": [
        AccountCombination(account="4000", dimensions={
            "FD_1": "01",
            "FD_2": "100",
            "FD_3": None,
            "FD_4": None,
            "FD_5": None,
            "FD_6": None,
            "FD_7": None,
            "FD_8": "01",
        })
    ],
    "5000": [
        AccountCombination(account="5000", dimensions={
            "FD_1": "02",
            "FD_2": "200",
            "FD_3": None,
            "FD_4": None,
            "FD_5": None,
            "FD_6": None,
            "FD_7": None,
            "FD_8": "02",
        })
    ]
}

_gl_entries: list[GLEntry] = [
    # 2025 Entries
    GLEntry(
        id=uuid4(),
        journal_date=date(2025, 7, 14),
        account_number="1000",
        account_name="Cash",
        debit=10000.00,
        credit=0.00,
        currency="USD",
        financial_dimensions={"FD_1": "01", "FD_2": "100", "FD_8": "01"},
        reference="AR-001",
        description="Customer payment received",
        source="Accounts Receivable",
        created_at=datetime.utcnow(),
        posted_by="admin"
    ),
    GLEntry(
        id=uuid4(),
        journal_date=date(2025, 7, 14),
        account_number="4000",
        account_name="Sales Revenue",
        debit=0.00,
        credit=10000.00,
        currency="USD",
        financial_dimensions={"FD_1": "01", "FD_2": "100", "FD_8": "01"},
        reference="AR-001",
        description="Revenue from sale",
        source="Accounts Receivable",
        created_at=datetime.utcnow(),
        posted_by="admin"
    ),
    GLEntry(
        id=uuid4(),
        journal_date=date(2025, 7, 15),
        account_number="5000",
        account_name="Cost of Goods Sold",
        debit=4000.00,
        credit=0.00,
        currency="USD",
        financial_dimensions={"FD_1": "02", "FD_2": "200", "FD_8": "02"},
        reference="COGS-2025-01",
        description="Cost of sold inventory",
        source="Inventory",
        created_at=datetime.utcnow(),
        posted_by="admin"
    ),
    GLEntry(
        id=uuid4(),
        journal_date=date(2025, 1, 15),
        account_number="1000",
        account_name="Cash",
        debit=0.00,
        credit=4000.00,
        currency="USD",
        financial_dimensions={"FD_1": "02", "FD_2": "200", "FD_8": "02"},
        reference="COGS-2025-01",
        description="Inventory purchase payment",
        source="Inventory",
        created_at=datetime.utcnow(),
        posted_by="admin"
    ),

    # 2024 Entries
    GLEntry(
        id=uuid4(),
        journal_date=date(2024, 12, 30),
        account_number="1000",
        account_name="Cash",
        debit=8000.00,
        credit=0.00,
        currency="USD",
        financial_dimensions={"FD_1": "01", "FD_2": "100", "FD_8": "01"},
        reference="AR-2024-001",
        description="End-of-year payment",
        source="Accounts Receivable",
        created_at=datetime.utcnow(),
        posted_by="admin"
    ),
    GLEntry(
        id=uuid4(),
        journal_date=date(2024, 12, 30),
        account_number="4000",
        account_name="Sales Revenue",
        debit=0.00,
        credit=8000.00,
        currency="USD",
        financial_dimensions={"FD_1": "01", "FD_2": "100", "FD_8": "01"},
        reference="AR-2024-001",
        description="End-of-year revenue",
        source="Accounts Receivable",
        created_at=datetime.utcnow(),
        posted_by="admin"
    ),
    GLEntry(
        id=uuid4(),
        journal_date=date(2024, 11, 15),
        account_number="2000",
        account_name="Accounts Payable",
        debit=0.00,
        credit=5000.00,
        currency="USD",
        financial_dimensions={"FD_1": "02", "FD_2": "200", "FD_8": "02"},
        reference="AP-2024-015",
        description="Vendor invoice",
        source="Accounts Payable",
        created_at=datetime.utcnow(),
        posted_by="admin"
    ),
    GLEntry(
        id=uuid4(),
        journal_date=date(2024, 11, 15),
        account_number="5000",
        account_name="Cost of Goods Sold",
        debit=5000.00,
        credit=0.00,
        currency="USD",
        financial_dimensions={"FD_1": "02", "FD_2": "200", "FD_8": "02"},
        reference="AP-2024-015",
        description="Inventory expense",
        source="Accounts Payable",
        created_at=datetime.utcnow(),
        posted_by="admin"
    ),
]

_subledger_entries: list[SubledgerEntry] = [
    SubledgerEntry(
        id=uuid4(),
        subledger_type="Accounts Receivable",
        reference="AR-001",
        document_date=date(2025, 7, 14),
        document_number="INV-1001",
        amount=10000.00,
        currency="USD",
        party="Customer A",
        description="Invoice to Customer A",
        posted_to_gl=True,
        gl_entry_ids=[
            e.id for e in _gl_entries if e.reference == "AR-001"
        ],
        created_at=datetime.utcnow()
    ),
    SubledgerEntry(
        id=uuid4(),
        subledger_type="Inventory",
        reference="COGS-2025-01",
        document_date=date(2025, 7, 15),
        document_number="INV-COGS-2025-01",
        amount=4000.00,
        currency="USD",
        party="Inventory System",
        description="Cost of goods sold",
        posted_to_gl=True,
        gl_entry_ids=[
            e.id for e in _gl_entries if e.reference == "COGS-2025-01"
        ],
        created_at=datetime.utcnow()
    ),
    SubledgerEntry(
        id=uuid4(),
        subledger_type="Accounts Receivable",
        reference="AR-2024-001",
        document_date=date(2024, 12, 30),
        document_number="INV-2024-EOY",
        amount=8000.00,
        currency="USD",
        party="Customer B",
        description="Year-end invoice",
        posted_to_gl=True,
        gl_entry_ids=[
            e.id for e in _gl_entries if e.reference == "AR-2024-001"
        ],
        created_at=datetime.utcnow()
    ),
    SubledgerEntry(
        id=uuid4(),
        subledger_type="Accounts Payable",
        reference="AP-2024-015",
        document_date=date(2024, 11, 15),
        document_number="BILL-2024-015",
        amount=5000.00,
        currency="USD",
        party="Vendor X",
        description="Invoice from vendor",
        posted_to_gl=True,
        gl_entry_ids=[
            e.id for e in _gl_entries if e.reference == "AP-2024-015"
        ],
        created_at=datetime.utcnow()
    )
]

_general_journal_header: list[GeneralJournal] = [
    GeneralJournal(
        journalID="GJ-000001",
        document_date=date(2025, 1, 1),
        type="Opening",
        description="Opening balances for new fiscal year",
        status="posted",

    ),
    GeneralJournal(
        journalID="GJ-000002",
        document_date=date(2025, 1, 15),
        type="Accrual",
        description="Accrual for utilities",
        status="posted",

    ),
    GeneralJournal(
        journalID="GJ-000003",
        document_date=date(2025, 2, 1),
        type="Payroll",
        description="January payroll expenses",
        status="draft",

    ),
    GeneralJournal(
        journalID="GJ-000004",
        document_date=date(2025, 2, 10),
        type="Adjustment",
        description="Reclassify office supply expenses",
        status="posted",

    )
]

_journal_lines: dict[str, list[JournalLine]] = {
    "GJ-000001": [
        JournalLine(
            lineID="JL-000001-01",
            journalID="GJ-000001",
            account="1000",
            description="Opening cash balance",
            debit=50000.00,
            credit=0.00
        ),
        JournalLine(
            lineID="JL-000001-02",
            journalID="GJ-000001",
            account="3000",
            description="Opening retained earnings",
            debit=0.00,
            credit=50000.00
        ),
    ],
    "GJ-000002": [
        JournalLine(
            lineID="JL-000002-01",
            journalID="GJ-000002",
            account="5000",
            description="Utilities expense",
            debit=3000.00,
            credit=0.00
        ),
        JournalLine(
            lineID="JL-000002-02",
            journalID="GJ-000002",
            account="2000",
            description="Accrued utilities payable",
            debit=0.00,
            credit=3000.00
        ),
    ],
    "GJ-000003": [
        JournalLine(
            lineID="JL-000003-01",
            journalID="GJ-000003",
            account="5000",
            description="Payroll expense",
            debit=10000.00,
            credit=0.00
        ),
        JournalLine(
            lineID="JL-000003-02",
            journalID="GJ-000003",
            account="1000",
            description="Payroll disbursement",
            debit=0.00,
            credit=10000.00
        ),
    ],
    "GJ-000004": [
        JournalLine(
            lineID="JL-000004-01",
            journalID="GJ-000004",
            account="5000",
            description="Reclassify supply expense",
            debit=1200.00,
            credit=0.00
        ),
        JournalLine(
            lineID="JL-000004-02",
            journalID="GJ-000004",
            account="1000",
            description="Adjust cash for reclass",
            debit=0.00,
            credit=1200.00
        ),
    ],
}
