"use client";

import { createContext, useContext, ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { User } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signin: (username: string) => Promise<{ username: string; id: string }>;
  signout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const PUBLIC_ROUTES = ["/", "/signup"];
const DEFAULT_REDIRECT = "/chat";
const AUTH_REDIRECT = "/";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuth();

  useEffect(() => {
    if (auth.isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (auth.isAuthenticated && isPublicRoute) {
      router.replace(DEFAULT_REDIRECT);
    } else if (!auth.isAuthenticated && !isPublicRoute) {
      router.replace(AUTH_REDIRECT);
    }
  }, [auth.isAuthenticated, auth.isLoading, pathname, router]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
