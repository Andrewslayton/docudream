"use client";

import { useAuth } from "../context/AuthContext";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";

interface Post {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  likes: number;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  posts: Post[];
}

const GET_USER = gql`
  query GetUser {
    me {
      id
      name
      email
      posts {
        id
        title
        body
        createdAt
        likes
      }
    }
  }
`;

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);

  const { data, loading, error } = useQuery<{ me: User }>(GET_USER, {
    skip: !user,
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  useEffect(() => {
    if (data?.me?.posts) {
      setPosts(data.me.posts);
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
        <div className="bg-gray-800 border border-purple-500/20 rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-purple-200 mb-2">
            {data?.me?.name || "Anonymous"}
          </h1>
          <p className="text-purple-400">{data?.me?.email}</p>
        </div>

        <div className="bg-gray-800 border border-purple-500/20 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-purple-200 mb-6">My Posts</h2>
          <div className="space-y-6">
            {posts.length === 0 ? (
              <p className="text-purple-400">No posts yet</p>
            ) : (
              posts.map((post) => (
                <div
                  key={`post-${post.id}`}
                  className="border-b border-purple-500/20 pb-4 last:border-b-0 last:pb-0"
                >
                  <h3 className="text-lg font-medium text-purple-200">
                    {post.title}
                  </h3>
                  <p className="text-purple-300 mt-2">{post.body}</p>
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-purple-400 text-sm">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-400">
                        {post.likes} likes
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
