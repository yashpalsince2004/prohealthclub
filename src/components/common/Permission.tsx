import React from "react";
import { useAuth } from "../../hooks/useAuth";

type PermissionMode = "hide" | "disable" | "readOnly";

interface PermissionProps {
  roles?: string[];
  permissions?: string[];
  mode?: PermissionMode;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Client-side role-to-permissions default mapping rules
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ["*"], // Wildcard matches all
  receptionist: [
    "member.read", "member.create", "member.update",
    "membership.read", "membership.create", "membership.update", "membership.freeze", "membership.cancel",
    "payment.read", "payment.create", "payment.receipt",
    "attendance.read", "attendance.create", "attendance.update",
    "lead.read", "lead.create", "lead.update",
    "reports.read"
  ],
  trainer: [
    "member.read",
    "workout.read", "workout.create", "workout.update",
    "diet.read", "diet.create", "diet.update",
    "exercise.read"
  ],
  member: [
    "member.read-self",
    "workout.read-self",
    "diet.read-self",
    "payment.read-self"
  ]
};

export function hasPermission(
  userRole: string,
  requiredRoles?: string[],
  requiredPermissions?: string[]
): boolean {
  // 1. Role match check
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(userRole)) {
      return false;
    }
  }

  // 2. Permission match check
  if (requiredPermissions && requiredPermissions.length > 0) {
    const userAllowedPerms = ROLE_PERMISSIONS[userRole] || [];
    
    // Admin has total access
    if (userAllowedPerms.includes("*")) {
      return true;
    }

    // Check that every required permission matches or has a wildcard match
    return requiredPermissions.every((reqPerm) => {
      // Check exact match
      if (userAllowedPerms.includes(reqPerm)) {
        return true;
      }
      
      // Check prefix wildcard match (e.g. member.read matches member.*)
      const parts = reqPerm.split(".");
      if (parts.length > 0) {
        const wildcardPattern = `${parts[0]}.*`;
        if (userAllowedPerms.includes(wildcardPattern)) {
          return true;
        }
      }
      
      return false;
    });
  }

  return true;
}

export default function Permission({
  roles,
  permissions,
  mode = "hide",
  children,
  fallback = null
}: PermissionProps) {
  const { user } = useAuth();

  if (!user) {
    return mode === "hide" ? (fallback as React.JSX.Element) : null;
  }

  const allowed = hasPermission(user.role, roles, permissions);

  if (allowed) {
    return <>{children}</>;
  }

  if (mode === "hide") {
    return (fallback as React.JSX.Element);
  }

  // Disable or Read-only mode: Clone children and apply disabled/readOnly props
  return (
    <>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        
        const extraProps: Record<string, any> = {};
        if (mode === "disable") {
          extraProps.disabled = true;
          extraProps["aria-disabled"] = "true";
          // Add opacity/pointer events tailwind style to represent disabled state
          extraProps.className = `${child.props.className || ""} opacity-50 cursor-not-allowed pointer-events-none`;
        } else if (mode === "readOnly") {
          extraProps.readOnly = true;
          extraProps.className = `${child.props.className || ""} cursor-default focus:ring-0`;
        }

        return React.cloneElement(child, extraProps);
      })}
    </>
  );
}
