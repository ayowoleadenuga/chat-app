import { Button } from "../ui/button";

interface ErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function Error({
  message = "Something went wrong",
  onRetry,
}: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <p className="text-destructive mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
