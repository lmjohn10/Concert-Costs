"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Calculator,
  Heart,
  ListMusic,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/cn";

const mainLinks = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3, short: "Home" },
  { href: "/add", label: "Add Concert", icon: PlusCircle, short: "Add" },
  { href: "/concerts", label: "My Concerts", icon: ListMusic, short: "Shows" },
  { href: "/simulator", label: "What-If", icon: Calculator, short: "What-If" },
] as const;

const featureLinks = [
  {
    href: "/deals",
    label: "Deal Alerts",
    icon: Bell,
    short: "Deals",
    description: "Price drops & deals",
  },
  {
    href: "/memories",
    label: "Tour Memories",
    icon: Heart,
    short: "Memories",
    description: "Timeline & archive",
  },
] as const;

function TabLink({
  href,
  label,
  short,
  icon: Icon,
  active,
  className,
}: {
  href: string;
  label: string;
  short: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={active}
      className={cn(
        "tab gap-1.5 transition-all duration-200 min-h-10",
        active && "tab-active",
        className
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{short}</span>
    </Link>
  );
}

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-3" aria-label="Main navigation">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50 mb-1.5 px-1">
          Concerts
        </p>
        <div
          role="tablist"
          className="tabs tabs-boxed bg-base-200 p-1 flex-wrap w-full"
        >
          {mainLinks.map((link) => (
            <TabLink
              key={link.href}
              {...link}
              active={pathname === link.href}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50 mb-1.5 px-1">
          More features
        </p>
        <div
          role="tablist"
          className="tabs tabs-boxed bg-linear-to-r from-primary/15 via-secondary/10 to-accent/15 border border-primary/20 p-1 flex-wrap w-full"
        >
          {featureLinks.map((link) => (
            <TabLink
              key={link.href}
              href={link.href}
              label={link.label}
              short={link.short}
              icon={link.icon}
              active={pathname === link.href}
              className="flex-1 sm:flex-none min-w-[calc(50%-0.25rem)] sm:min-w-0"
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
