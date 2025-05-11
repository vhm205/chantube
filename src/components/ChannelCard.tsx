import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useState } from "react";

// Simple external link icon SVG component
const ExternalLinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="ml-1"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

interface ChannelProps {
  id: string;
  title: string;
  thumbnailUrl: string;
  subscriberCount?: string;
  description?: string;
  isKidFriendly?: boolean;
  category?: string;
  url?: string;
  onUnsubscribe: (id: string) => void;
}

export function ChannelCard({
  id,
  title,
  thumbnailUrl,
  subscriberCount,
  description,
  isKidFriendly,
  category,
  url,
  onUnsubscribe,
}: ChannelProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUnsubscribe = () => {
    setIsLoading(true);
    try {
      onUnsubscribe(id);
    } finally {
      // We'll set isLoading to false after a short delay to show the loading state
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  // Ensure we have a valid YouTube channel URL
  const channelUrl = url || `https://www.youtube.com/channel/${id}`;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md border-kidtube-light bg-white h-full flex flex-col">
      <CardContent className="p-0 flex-1">
        <div className="relative p-5 h-full flex flex-col">
          <div className="flex items-start gap-4 mb-3">
            <img
              alt={`${title} channel thumbnail`}
              className="h-16 w-16 rounded-full object-cover border-2 border-kidtube-light flex-shrink-0"
              src={thumbnailUrl || "/placeholder.svg"}
            />

            <div className="flex-1 space-y-1 overflow-hidden">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <h3 className="text-base font-bold leading-tight line-clamp-1 text-kidtube-foreground">
                  {title}
                </h3>
                {isKidFriendly && (
                  <span className="rounded-full bg-kidtube-primary/20 px-2.5 py-1 text-xs font-medium text-kidtube-primary flex-shrink-0">
                    Family-Friendly
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {subscriberCount && (
                  <p className="text-xs text-kidtube-secondary">
                    {subscriberCount} subscribers
                  </p>
                )}
                {category && (
                  <span className="rounded-full bg-kidtube-highlight px-2.5 py-0.5 text-xs font-medium text-kidtube-primary">
                    {category}
                  </span>
                )}
              </div>
            </div>
          </div>

          {description && (
            <p className="text-sm text-kidtube-secondary line-clamp-2 mt-2 mb-2 flex-grow">
              {description}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-3 border-t border-kidtube-light">
        <div className="w-full flex flex-col gap-2">
          <div className="flex gap-2 w-full">
            <Button
              onClick={handleUnsubscribe}
              variant="outline"
              size="sm"
              className="flex-1 border-kidtube-light text-kidtube-primary hover:bg-kidtube-highlight"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Unsubscribe"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-kidtube-light text-kidtube-primary hover:bg-kidtube-highlight flex items-center justify-center"
              onClick={() => window.open(channelUrl, '_blank', 'noopener,noreferrer')}
            >
              <span className="flex items-center">
                Visit <ExternalLinkIcon />
              </span>
            </Button>
          </div>

          {isLoading && (
            <p className="text-xs text-center text-kidtube-secondary">
              This may require additional permissions
            </p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
