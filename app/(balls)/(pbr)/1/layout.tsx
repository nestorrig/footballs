import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo 1 — Attractor",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
