export function Footer() {
  return (
    <footer className="border-t border-kidtube-light bg-kidtube-background py-6">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-center text-sm text-kidtube-foreground">
          &copy; {new Date().getFullYear()} EcoTube - Eco-friendly YouTube
          channel management
        </p>
        <div className="flex items-center gap-6">
          <a
            href="#"
            className="text-sm text-kidtube-secondary hover:text-kidtube-primary transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-sm text-kidtube-secondary hover:text-kidtube-primary transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="text-sm text-kidtube-secondary hover:text-kidtube-primary transition-colors"
          >
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}
