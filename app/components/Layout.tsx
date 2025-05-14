"use client";

import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-gray-900">
      <Navbar />
      <main className="pt-16">{children}</main>
    </div>
  );
}
