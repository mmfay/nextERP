CREATE TABLE GENERALJOURNALHEADER (
    journal_id    TEXT PRIMARY KEY,        -- e.g., "GJ-000123"
    document_date DATE NOT NULL,
    type          TEXT NOT NULL,           -- journal type
    description   TEXT,
    status        TEXT NOT NULL             -- e.g., 'draft', 'posted'
);
