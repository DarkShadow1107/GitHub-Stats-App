import Link from "next/link";
import { ToggleTheme } from "./toggle-theme";
import { siGithub } from "simple-icons";
import { Button } from "./ui/button";

export default function Navbar() {
  return (
    <nav className="z-10 fixed left-0 top-0 right-0 w-full mx-auto container mt-10 items-center justify-between font-mono text-xs flex">
      <Link href="/">startling-druid-cb30bc.netlify.app</Link>
      <div className="space-x-1">
        <Button asChild variant="outline" size="icon">
          <a
            href="https://github.com/DarkShadow1107/GitHub-Stats-App/tree/main"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              viewBox="0 0 24 24"
              width="20" //adjust the width as you like.
              height="20" //adjust the height as you like.
              fill="white"
              className="h-5" // Apply className here
            >
              <path d={siGithub.path} />
            </svg>
          </a>
        </Button>
        <ToggleTheme />
      </div>
    </nav>
  );
}
