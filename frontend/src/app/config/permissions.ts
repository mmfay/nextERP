export const Permissions = {
  VIEW_DASHBOARD: "view_dashboard",
  CREATE_INVOICE: "create_invoice",
  APPROVE_PAYMENT: "approve_payment",
  DELETE_USER: "delete_user",
  EXPORT_REPORTS: "export_reports",
  BASE: "base",
  // Add more as needed
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];