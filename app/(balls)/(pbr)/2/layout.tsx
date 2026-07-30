import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo 2 — Bubble",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
