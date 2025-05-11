import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export function Header() {
  const { isAuthenticated, login, logout, user, isLoading } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full bg-kidtube-background shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-kidtube-primary"
            >
              <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />

              <path d="m10 15 5-3-5-3z" />
            </svg>
            <span className="ml-2 text-xl font-bold text-kidtube-primary">
              EcoTube
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="mr-2 text-kidtube-primary hover:text-kidtube-primary/90 hover:bg-kidtube-highlight"
              >
                My Channels
              </Button>
              <div className="flex items-center">
                {user?.imageUrl && (
                  <img
                    src={user.imageUrl}
                    alt="User Avatar"
                    className="h-8 w-8 rounded-full border-2 border-kidtube-light"
                  />
                )}
                <span className="ml-2 hidden text-sm font-medium md:block">
                  {user?.name || "User"}
                </span>
              </div>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="border-kidtube-light text-kidtube-primary hover:bg-kidtube-highlight"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button
              onClick={login}
              disabled={isLoading}
              className="bg-kidtube-primary hover:bg-kidtube-primary/90"
            >
              {isLoading ? "Connecting..." : "Sign In with Google"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
