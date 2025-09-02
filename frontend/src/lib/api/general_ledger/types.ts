export type GeneralJournalTransLines = {
  lineID: number;
  journalID: string;
  account: string;
  description?: string;
  debit: number;
  credit: number;
  dimension: number;
  dimensions: Dimensions;
  offsetAccount?: string;
  offsetDimension?: number;
  offsetDimensions?: Dimensions;
  companyID: number;
  versionID: number;
  recordID: number;
  isModified?: boolean;
  isNew?: boolean;
};

export type Dimensions = {
  fd1?: string | null;
  fd2?: string | null;
  fd3?: string | null;
  fd4?: string | null;
  fd5?: string | null;
  fd6?: string | null;
  fd7?: string | null;
  fd8?: string | null;
  recordID: number;
};

export type FinancialDimension = {
  id: number;
  name: string;
  in_use: boolean;
};

export type GeneralJournal = {
  journalID: string;
  document_date: string;   
  type: string;
  description: string;
  status: string;          
  posted: string | null;  
  companyID: number;
  recordID: number;
};

export type GeneralJournalTransPayload = {
  journalID: string;
  updates: GeneralJournalTransLines[];
  inserts: GeneralJournalTransLines[];
};

export type GeneralJournalTransDelete = {
  versionID: number;
  recordID: number;
}