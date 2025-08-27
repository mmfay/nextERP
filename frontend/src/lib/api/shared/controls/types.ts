export type RecordControlProps = {
  loading: boolean;
  onCreate: () => void;
  onCreateDisabled: boolean;
  onDelete: () => void;
  onDeleteDisabled: boolean;
  onSave: () => void;
  onSaveDisabled: boolean;
};