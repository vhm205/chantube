import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-lg border border-kidtube-light bg-white p-8 text-center shadow-sm">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-kidtube-highlight">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-12 w-12 text-kidtube-primary"
        >
          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />

          <path d="m10 15 5-3-5-3z" />
        </svg>
      </div>
      <h3 className="mt-6 text-xl font-semibold text-kidtube-primary">{title}</h3>
      <p className="mt-3 text-kidtube-secondary max-w-md">{description}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="mt-6 bg-kidtube-primary hover:bg-kidtube-primary/90"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
