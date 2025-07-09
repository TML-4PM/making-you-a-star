
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  GraduationCap, 
  Bookmark, 
  Upload, 
  Users, 
  Briefcase,
  BarChart3
} from "lucide-react";
import { UserMenu } from "./UserMenu";

const navigation = [
  { name: "Stories", href: "/", icon: BookOpen },
  { name: "Study", href: "/study", icon: GraduationCap },
  { name: "Practice", href: "/practice", icon: BarChart3 },
  { name: "Bookmarks", href: "/bookmarks", icon: Bookmark },
  { name: "Groups", href: "/groups", icon: Users },
  { name: "Job Descriptions", href: "/job-descriptions", icon: Briefcase },
  { name: "Upload", href: "/upload", icon: Upload },
];

export function AppNavigation() {
  const location = useLocation();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <h1 className="text-xl font-bold">Interview Prep</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium",
                      location.pathname === item.href
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center">
            <UserMenu />
          </div>
          <div className="flex sm:hidden">
            <div className="space-y-1 px-4 pb-3 pt-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.name}
                    asChild
                    variant={location.pathname === item.href ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Link to={item.href}>
                      <Icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
