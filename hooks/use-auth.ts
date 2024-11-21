import { useCallback, useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { useStore } from "@/store/hooks";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const { user, setUser, clearStore } = useStore();
  const utils = trpc.useUtils();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const { mutateAsync: signinMutation } = trpc.user.signin.useMutation({
    onSuccess: (data) => {
      setUser(data);
      utils.user.me.invalidate();
    },
  });

  const { refetch: refetchUser } = trpc.user.me.useQuery(undefined, {
    enabled: false,
    retry: 1,
    retryDelay: 1000,
  });

  const verifyAuth = useCallback(async () => {
    const token = localStorage.getItem("authToken");

    if (!token && isInitialized) {
      return;
    }

    try {
      setIsLoading(true);

      if (!token) {
        clearStore();
        return;
      }

      const result = await refetchUser();

      if (result.data) {
        setUser(result.data);
      } else {
        throw new Error("Failed to load user data");
      }
    } catch (error) {
      console.error("Auth verification failed:", error);
      localStorage.removeItem("authToken");
      clearStore();
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [refetchUser, setUser, clearStore, isInitialized]);

  useEffect(() => {
    if (!isInitialized) {
      verifyAuth();
    }
  }, [isInitialized, verifyAuth]);

  const signin = useCallback(
    async (username: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await signinMutation({ username });

        // Store token
        const token = `Bearer ${result.id}`;
        localStorage.setItem("authToken", token);
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "authToken",
            newValue: token,
          })
        );

        // Set user data
        setUser(result);

        toast({
          title: "Welcome!",
          description: `Signed in as ${result.username}`,
        });

        setIsInitialized(false);

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to sign in";
        setError(errorMessage);
        localStorage.removeItem("authToken");
        clearStore();

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [signinMutation, setUser, clearStore, toast]
  );

  const signout = useCallback(async () => {
    try {
      setIsLoading(true);

      clearStore();
      localStorage.removeItem("authToken");
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "authToken",
          oldValue: localStorage.getItem("authToken"),
          newValue: null,
        })
      );

      await utils.invalidate();

      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });

      // Reset initialization state
      setIsInitialized(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to sign out";
      setError(errorMessage);

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [utils, clearStore, toast]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    signin,
    signout,
  };
}
