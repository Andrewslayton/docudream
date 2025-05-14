"use client";

import { useAuth } from "../context/AuthContext";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Link from "next/link";

interface User {
  id: string;
  name: string | null;
  email: string;
}

const GET_FOLLOWING = gql`
  query GetFollowing {
    me {
      following {
        id
        name
        email
      }
    }
  }
`;

export default function Following() {
  const { user } = useAuth();
  const router = useRouter();
  const [following, setFollowing] = useState<User[]>([]);

  const { data, loading, error } = useQuery<{ me: { following: User[] } }>(
    GET_FOLLOWING,
    {
      skip: !user,
    }
  );

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  useEffect(() => {
    if (data?.me?.following) {
      setFollowing(data.me.following);
    }
  }, [data]);

  if (!user) {
    return null;
  }

  if (loading && !data) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-purple-200 text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-red-400 text-center">Error: {error.message}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-gray-800 border border-purple-500/20 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-purple-200 mb-6">Following</h2>
          <div className="space-y-4">
            {following.length === 0 ? (
              <p className="text-purple-400">Not following anyone yet</p>
            ) : (
              following.map((user) => (
                <div
                  key={`user-${user.id}`}
                  className="border-b border-purple-500/20 pb-4 last:border-b-0 last:pb-0"
                >
                  <h3 className="text-lg font-medium text-purple-200">
                    {user.name || "Anonymous"}
                  </h3>
                  <p className="text-purple-400">{user.email}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
