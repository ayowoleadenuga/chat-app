"use client";

import { usePathname } from "next/navigation";
import { Loading } from "@/components/shared/loading";
import { PUBLIC_ROUTES, useAuthContext } from "@/providers/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const pathname = usePathname();

  if (isLoading) {
    return <Loading />;
  }

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  if (!isAuthenticated && !isPublicRoute) {
    return null;
  }

  if (isAuthenticated && isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}
