import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo 3 — Gravity",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
