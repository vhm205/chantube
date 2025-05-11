import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const features = [
  {
    title: "Eco-Friendly Content",
    description:
      "Smart filtering to display channels that promote environmental awareness and sustainability.",
    icon: (
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
        className="text-kidtube-primary"
      >
        <path d="M8.5 8.5a2.5 2.5 0 0 1 5 0v1.5H8.5Z" />
        <path d="M8.5 14a2.5 2.5 0 0 0 5 0" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  {
    title: "Channel Management",
    description:
      "Easily organize and curate your subscriptions for a more mindful viewing experience.",
    icon: (
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
        className="text-kidtube-secondary"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M7 7h10" />
        <path d="M7 12h10" />
        <path d="M7 17h10" />
      </svg>
    ),
  },
  {
    title: "Seamless Integration",
    description:
      "Connect with your Google account to access and manage your YouTube subscriptions effortlessly.",
    icon: (
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
        className="text-kidtube-accent"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 22v-4" />
        <path d="M12 6V2" />
        <path d="m4.93 4.93 2.83 2.83" />
        <path d="m16.24 16.24 2.83 2.83" />
        <path d="M2 12h4" />
        <path d="M18 12h4" />
        <path d="m4.93 19.07 2.83-2.83" />
        <path d="m16.24 7.76 2.83-2.83" />
      </svg>
    ),
  },
];

export default function LandingPage() {
  const { isAuthenticated, login, isLoading, user } = useAuth();
  const navigate = useNavigate();

  // Effect to redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="container flex flex-col items-center justify-center py-10">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex items-center rounded-full bg-kidtube-highlight px-4 py-2 text-sm font-medium text-kidtube-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="m9 9-2 2 2 2" />
              <path d="m15 9 2 2-2 2" />
              <path d="m12 12-1-1h2l-1 1z" />
              <rect width="20" height="16" x="2" y="4" rx="2" />
            </svg>
            Sustainable content management
          </div>
        </div>
        <h1 className="mb-8 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          <span className="block text-kidtube-primary">EcoTube</span>
          <span className="block text-2xl font-semibold text-kidtube-secondary mt-2">
            Eco-friendly YouTube channel management
          </span>
        </h1>
        <p className="mb-10 text-lg text-kidtube-secondary leading-relaxed">
          Discover and manage content that promotes environmental awareness and sustainability.
          Filter channels, organize your subscriptions, and create a more mindful
          viewing experience.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          {isAuthenticated ? (
            <Button
              onClick={() => navigate("/dashboard")}
              size="lg"
              className="bg-kidtube-primary hover:bg-kidtube-primary/90 min-w-[200px]"
            >
              Access Your Channels
            </Button>
          ) : (
            <Button
              onClick={login}
              size="lg"
              disabled={isLoading}
              className="bg-kidtube-primary hover:bg-kidtube-primary/90 min-w-[200px]"
            >
              {isLoading ? "Connecting..." : "Sign in with Google"}
            </Button>
          )}
          <Button
            variant="outline"
            size="lg"
            className="border-kidtube-light text-kidtube-primary hover:bg-kidtube-highlight min-w-[200px]"
          >
            Explore Features
          </Button>
        </div>
      </div>

      <div className="mt-20 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex flex-col items-center rounded-lg border border-kidtube-light bg-white p-8 text-center shadow-sm transition-all hover:shadow-md hover:border-kidtube-primary/30"
          >
            <div className="mb-5 rounded-full bg-kidtube-highlight p-4">
              {feature.icon}
            </div>
            <h3 className="mb-3 text-xl font-semibold text-kidtube-primary">{feature.title}</h3>
            <p className="text-kidtube-secondary">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-20 rounded-xl bg-kidtube-highlight p-10 text-center">
        <h2 className="mb-8 text-3xl font-bold text-kidtube-primary">How It Works</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center bg-white rounded-lg p-6 shadow-sm">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-kidtube-primary text-white font-bold text-xl">
              1
            </div>
            <h3 className="mb-3 text-xl font-semibold text-kidtube-primary">Connect</h3>
            <p className="text-kidtube-secondary">
              Sign in with your Google account to access your YouTube channel subscriptions.
            </p>
          </div>
          <div className="flex flex-col items-center bg-white rounded-lg p-6 shadow-sm">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-kidtube-secondary text-white font-bold text-xl">
              2
            </div>
            <h3 className="mb-3 text-xl font-semibold text-kidtube-primary">Discover</h3>
            <p className="text-kidtube-secondary">
              Our intelligent system identifies eco-friendly and sustainable content channels.
            </p>
          </div>
          <div className="flex flex-col items-center bg-white rounded-lg p-6 shadow-sm">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-kidtube-accent text-white font-bold text-xl">
              3
            </div>
            <h3 className="mb-3 text-xl font-semibold text-kidtube-primary">Organize</h3>
            <p className="text-kidtube-secondary">
              Easily manage your subscriptions and create a more mindful viewing experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
