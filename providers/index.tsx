import { TrpcProvider } from "./trpc";
import { AuthProvider } from "./auth";
import { Toaster } from "@/components/ui/toaster";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <TrpcProvider>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </TrpcProvider>
  );
};
