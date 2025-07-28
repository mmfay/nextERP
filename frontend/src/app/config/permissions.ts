export const Permissions = {
    BASE: "base",
    VIEW_DASHBOARD: "view_dashboard",
    CREATE_INVOICE: "create_invoice",
    APPROVE_PAYMENT: "approve_payment",
    DELETE_USER: "delete_user",
    EXPORT_REPORTS: "export_reports",
    MOD_GL: "mod_gl",
    MOD_PURCH: "mod_purch",
    MOD_SALES: "mod_sales",
    MOD_SYSADMIN: "mod_sysAdmin",
    SETUP_GL: "setup_gl",
  // Add more as needed
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];