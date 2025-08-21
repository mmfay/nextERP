DROP TABLE IF EXISTS GENERALJOURNALHEADER CASCADE;

CREATE TABLE GENERALJOURNALHEADER (
    journal_id     TEXT   NOT NULL UNIQUE,          -- business id (GJ-000123)
    document_date  DATE   NOT NULL,
    type           TEXT   NOT NULL,                 -- journal type
    description    TEXT,
    status         TEXT   NOT NULL,                 -- 'draft' | 'posted'
    posted         TIMESTAMPTZ,                     -- NULL until posted
    company_id     INT   NOT NULL,                  -- owning company
    record_id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
);

DROP TABLE IF EXISTS GENERALJOURNALLINES CASCADE;

CREATE TABLE GENERALJOURNALLINES (
    journal_id    VARCHAR(36) NOT NULL,            -- FK to general_journal_header
    line_id       INT NOT NULL,                    -- line number inside journal
    account       VARCHAR(50) NOT NULL,            -- GL account number
    description   TEXT,                            -- optional description
    debit         NUMERIC(18, 2) DEFAULT 0 NOT NULL,
    credit        NUMERIC(18, 2) DEFAULT 0 NOT NULL,
    company_id    INT NOT NULL,                    -- FK to companies table
    record_id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    CONSTRAINT chk_positive_amounts CHECK (
        (debit >= 0 AND credit >= 0)
        AND NOT (debit > 0 AND credit > 0)         -- prevent both debit & credit > 0
    ),

    CONSTRAINT fk_journal FOREIGN KEY (journal_id) -- on delete of header, cascade to lines
        REFERENCES GENERALJOURNALHEADER (journal_id)
        ON DELETE CASCADE

);

-- Indexes
CREATE INDEX idx_gjl_company_account
    ON GENERALJOURNALLINES (company_id, account);

CREATE INDEX idx_gjl_journal_company
    ON GENERALJOURNALLINES (journal_id, company_id);
