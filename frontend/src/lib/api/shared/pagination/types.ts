export type Page<T> = {
  items: T[];
  has_next: boolean;
  has_prev: boolean;
  next_cursor?: string | null;
  prev_cursor?: string | null;
  limit: number;
};

export type PaginationControlsProps = {
  loading: boolean;
  currentPage: number;
  hasPrev: boolean;
  hasNext: boolean;
  nextCursor?: number | null;
  onRefresh: () => void;
  onPrev: () => void;
  onNext: () => void;
};