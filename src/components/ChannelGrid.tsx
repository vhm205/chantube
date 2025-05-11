import { ChannelCard } from "@/components/ChannelCard";
import { Button } from "@/components/ui/button";
import { Channel } from "@/types";

interface ChannelGridProps {
  channels: Channel[];
  onUnsubscribe: (id: string) => void;
}

export function ChannelGrid({ channels, onUnsubscribe }: ChannelGridProps) {
  if (channels.length === 0) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-lg border border-kidtube-light bg-white shadow-sm">
        <div className="flex flex-col items-center justify-center space-y-4 text-center p-6">
          <div className="rounded-full bg-kidtube-highlight p-4">
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
          <h3 className="text-xl font-semibold text-kidtube-primary">No Channels Available</h3>
          <p className="text-kidtube-secondary max-w-md">
            We couldn't find any channels matching your current filters. Try adjusting your search criteria.
          </p>
          <Button
            variant="outline"
            className="mt-4 border-kidtube-light text-kidtube-primary hover:bg-kidtube-highlight"
            onClick={() => window.location.reload()}
          >
            Refresh Content
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {channels.map((channel) => (
        <ChannelCard
          key={channel.id}
          id={channel.id}
          title={channel.title}
          thumbnailUrl={channel.thumbnailUrl}
          subscriberCount={channel.subscriberCount}
          description={channel.description}
          isKidFriendly={channel.isKidFriendly}
          category={channel.category}
          url={channel.url || `https://www.youtube.com/channel/${channel.id}`}
          onUnsubscribe={onUnsubscribe}
        />
      ))}
    </div>
  );
}
