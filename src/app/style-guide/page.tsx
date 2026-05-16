import Link from "next/link";

import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  Textarea,
} from "@/components/ui";

import { StyleGuideExamples } from "./style-guide-examples";

const colorTokens = [
  ["Indigo", "var(--weldoo-indigo)", "#3d3db4"],
  ["Indigo dark", "var(--weldoo-indigo-dark)", "#2d2d9a"],
  ["Periwinkle", "var(--weldoo-peri)", "#7b7fe8"],
  ["Sky", "var(--weldoo-sky)", "#42b8d4"],
  ["Mint", "var(--weldoo-mint)", "#5ce8b4"],
  ["Ink", "var(--weldoo-ink)", "#0c0c18"],
  ["Slate", "var(--weldoo-slate)", "#44446a"],
  ["Muted", "var(--weldoo-muted)", "#7a7a9a"],
  ["Border", "var(--weldoo-border)", "#e0e0ed"],
  ["Background", "var(--weldoo-bg)", "#f5f5fb"],
];

const navItems = ["Feed", "Network", "Jobs", "Academy"];

export default function StyleGuidePage() {
  return (
    <main className="min-h-screen bg-weldoo-bg px-6 py-10 text-weldoo-ink">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <header className="space-y-3">
          <Link className="text-sm font-semibold text-weldoo-indigo" href="/">
            Back to project home
          </Link>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-weldoo-indigo">
              Sprint 0.1.3
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              Weldoo UI foundation
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-weldoo-muted">
              Design tokens and base UI components for building the Weldoo MVP
              sprint by sprint.
            </p>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Color tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {colorTokens.map(([name, variable, hex]) => (
                <div
                  className="overflow-hidden rounded-weldoo-md border border-weldoo-border-light bg-white shadow-weldoo-sm"
                  key={name}
                >
                  <div
                    className="h-20"
                    style={{ backgroundColor: variable }}
                  />
                  <div className="space-y-1 p-3">
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="font-mono text-xs text-weldoo-muted">
                      {hex}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="shadow-weldoo-md">
            <CardHeader>
              <CardTitle>Actions and forms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button>Primary action</Button>
                <Button variant="secondary">Secondary action</Button>
                <Button variant="ghost">Neutral action</Button>
                <Button variant="danger">Danger action</Button>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <Input
                  label="Professional title"
                  placeholder="TIG Welder · Stainless Steel"
                />
                <Select label="Availability" defaultValue="">
                  <option value="" disabled>
                    Select availability
                  </option>
                  <option>Available</option>
                  <option>Open to opportunities</option>
                  <option>Not available</option>
                </Select>
                <div className="sm:col-span-2">
                  <Textarea
                    label="Bio"
                    placeholder="Describe welding experience, processes, materials, and availability."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-weldoo-md">
            <div className="h-20 bg-[linear-gradient(135deg,#2a2a8a_0%,#3d3db4_35%,#42b8d4_70%,#5ce8b4_100%)]" />
            <CardContent className="pt-0">
              <Avatar className="-mt-6 rounded-weldoo-md" initials="DW" />
              <h2 className="mt-3 text-base font-bold">Demo Welder</h2>
              <p className="mt-1 text-sm leading-5 text-weldoo-slate">
                Senior TIG Welder · Pressure vessels
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["TIG", "316L", "6G", "EN ISO 9606-1"].map((tag) => (
                  <Badge key={tag} variant="neutral">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Navigation states</CardTitle>
          </CardHeader>
          <CardContent>
            <nav className="flex flex-wrap gap-2">
              {navItems.map((item, index) => (
                <button
                  className={
                    index === 0
                      ? "rounded-full bg-weldoo-indigo/10 px-4 py-2 text-sm font-semibold text-weldoo-indigo"
                      : "rounded-full px-4 py-2 text-sm font-medium text-weldoo-muted transition hover:bg-weldoo-bg-strong hover:text-weldoo-ink"
                  }
                  key={item}
                >
                  {item}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        <StyleGuideExamples />
      </div>
    </main>
  );
}
