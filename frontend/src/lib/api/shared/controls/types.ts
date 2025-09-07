export type RecordControlProps = {
  loading: boolean;
  onCreate: () => void;
  onCreateDisabled: boolean;
  onDelete: () => void;
  onDeleteDisabled: boolean;
  onSave: () => void;
  onSaveDisabled: boolean;
};

export type PostControlProps = {
  loading: boolean;
  onValidate: () => void;
  onValidateDisabled: boolean;
  onPost: () => void;
  onPostDisabled: boolean;
};