import { Icons } from "./icons";

interface LoadingProps {
  message?: string;
}

export function Loading({ message = "Loading..." }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <Icons.spinner className="h-8 w-8 animate-spin" />
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
