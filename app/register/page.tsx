"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation Register($email: String!, $password: String!, $name: String) {
              register(email: $email, password: $password, name: $name) {
                token
                user {
                  id
                  email
                  name
                }
              }
            }
          `,
          variables: {
            email,
            password,
            name: name || undefined,
          },
        }),
      });

      const data = await response.json();

      if (data.errors) {
        setError(data.errors[0].message);
        return;
      }

      login(data.data.register.token, data.data.register.user);
      router.push("/");
    } catch (err) {
      setError("An error occurred during registration");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-900 to-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96 border border-purple-500/20">
        <h1 className="text-2xl font-bold text-center mb-6 text-purple-200">
          Register
        </h1>
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-200">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-200 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-200">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-200 focus:border-purple-500 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-200">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-200 focus:border-purple-500 focus:ring-purple-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-400 hover:text-purple-300">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
