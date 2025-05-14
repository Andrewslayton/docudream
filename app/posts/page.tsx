"use client";

import { useAuth } from "../context/AuthContext";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import CreatePostForm from "../components/CreatePostForm";

interface Post {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  likes: number;
  author: {
    id: string;
    name: string | null;
  };
}

const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      title
      body
      createdAt
      likes
      author {
        id
        name
      }
    }
  }
`;

export default function Posts() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  const { data, loading, error, refetch } = useQuery<{ posts: Post[] }>(
    GET_POSTS,
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
    if (data?.posts) {
      setPosts(data.posts);
    }
  }, [data]);

  const handlePostCreated = () => {
    setIsCreateFormOpen(false);
    refetch();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Date not available";
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Date not available";
    }
  };

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
          <h2 className="text-2xl font-bold text-purple-200 mb-6">Posts</h2>
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
                      Posted by {post.author.name || "Anonymous"} on{" "}
                      {formatDate(post.createdAt)}
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

        <button
          onClick={() => setIsCreateFormOpen(true)}
          className="fixed bottom-8 right-8 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>

        {isCreateFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 border border-purple-500/20 rounded-lg p-6 w-full max-w-lg">
              <CreatePostForm onPostCreated={handlePostCreated} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
