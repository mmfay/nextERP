"use client";

import { useAuth } from "@/app/context/AuthContext";
import { Permissions, Permission } from "@/app/config/permissions";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  permission: Permission;
};

export function SecureButton({ permission, children, ...props }: Props) {
  const { permissions, user, isLoading } = useAuth();
  const allowed = user?.is_sys_admin || permissions.includes(permission);

  if (isLoading) return null;

  return (
    <button
      {...props}
      disabled={!allowed || props.disabled}
      className={`
        ${props.className ?? ""}
        ${!allowed ? "opacity-50 cursor-not-allowed" : ""}
        transition-opacity duration-300 ease-in
      `}
    >
      {children}
    </button>
  );
}
