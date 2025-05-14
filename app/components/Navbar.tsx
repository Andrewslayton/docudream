"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 right-0 p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-50 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow"
      >
        <div className="w-8 h-8 flex items-center justify-center">
          <span className="text-2xl">☁️</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-0 right-0 mt-16 mr-4 bg-white rounded-lg shadow-xl p-4 w-48">
          <div className="space-y-2">
            <Link
              href="/login"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
