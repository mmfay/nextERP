INSERT INTO GENERALJOURNALTABLE (journal_id, document_date, type, description, status, posted, version_id, company_id)
VALUES
    ('GJ-000001', '2025-01-01', 'Opening', 'Opening balances for new fiscal year', 'posted', '2025-01-01 09:00:00', 1, 1),
    ('GJ-000002', '2025-01-02', 'Accrual', 'Accrual entry 2', 'posted', '2025-01-02 09:00:00', 1, 1),
    ('GJ-000003', '2025-01-03', 'Payroll', 'Payroll entry 3', 'draft', '2025-01-03 09:00:00', 1, 1),
    ('GJ-000004', '2025-01-04', 'Adjustment', 'Adjustment entry 4', 'draft', '2025-01-04 09:00:00', 1, 1),
    ('GJ-000005', '2025-01-05', 'Misc', 'Misc entry 5', 'draft', '2025-01-05 09:00:00', 1, 1);


-- Journal GJ-000200 (Misc, 2025-07-19)
INSERT INTO GENERALJOURNALTRANS
(journal_id, line_id, account, dimension, description, debit, credit, offsetAccount, offsetDimension, company_id, version_id) VALUES
('GJ-000005', 1, '6000', NULL, 'Misc expense', 500.00, 0.00, NULL, NULL, 1, 1),
('GJ-000005', 2, '1000', NULL, 'Cash', 0.00, 500.00, NULL, NULL, 1, 1),
('GJ-000004', 1, '1200', 1, 'Prepaid insurance adj', 0.00, 300.00, '6100', 1, 1, 1),
('GJ-000004', 2, '6100', 1, 'Insurance expense adj', 300.00, 0.00, '1200', 2, 1, 1),
('GJ-000003', 1, '7000', NULL, 'Wages expense', 2000.00, 0.00, NULL, NULL, 1, 1),
('GJ-000003', 2, '2100', NULL, 'Wages payable', 0.00, 2000.00, NULL, NULL, 1, 1),
('GJ-000002', 1, '6200', NULL, 'Utilities expense accrual', 400.00, 0.00, NULL, NULL, 1, 1),
('GJ-000002', 2, '2200', NULL, 'Accrued liabilities', 0.00, 400.00, NULL, NULL, 1, 1),
('GJ-000001', 1, '1000', NULL, 'Opening balance cash', 10000.00, 0.00, NULL, NULL, 1, 1),
('GJ-000001', 2, '3000', NULL, 'Opening retained earnings', 0.00, 10000.00, NULL, NULL, 1, 1);

INSERT INTO FINANCIALDIMENSIONS (id, name, in_use, company_id) VALUES
(1, 'Department', TRUE, 1),
(2, 'Cost Center', TRUE, 1),
(3, '', FALSE, 1),
(4, 'Project', TRUE, 1),
(5, '', FALSE, 1),
(6, '', FALSE, 1),
(7, '', FALSE, 1),
(8, 'Region', TRUE, 1);

INSERT INTO FINANCIALDIMENSIONVALUES (code, description, dimension, company_id, record_id) VALUES
('01', 'Marketing', 1, 1, 1),
('02', 'Finance', 1, 1, 2),
('100', 'West Coast', 2, 1, 3),
('200', 'East Coast', 2, 1, 4),
('01', 'Northwest', 8, 1, 5),
('02', 'Southwest', 8, 1, 6);

INSERT INTO FINANCIALDIMENSIONCOMBOS (fd1, fd2, fd3, fd4, fd5, fd6, fd7, fd8, version_id, company_id) VALUES 
('01', '100', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1),
('02', '100', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1);
