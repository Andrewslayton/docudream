"use client";

import { useAuth } from "../context/AuthContext";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import CreatePostForm from "../components/CreatePostForm";

const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      title
      body
      createdAt
      author {
        id
        name
        email
      }
      likes
      likedBy {
        id
      }
    }
  }
`;

const TOGGLE_LIKE = gql`
  mutation ToggleLike($postId: String!) {
    toggleLike(postId: $postId) {
      success
      message
      liked
    }
  }
`;

interface Post {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    email: string;
  };
  likes: number;
  likedBy: { id: string }[];
}

export default function Posts() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_POSTS, {
    skip: !user,
  });

  const [toggleLike] = useMutation(TOGGLE_LIKE, {
    onCompleted: (data) => {
      if (data.toggleLike.success) {
        refetch();
      }
    },
  });

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

  const formatDate = (dateString: string) => {
    try {
      // Remove any extra quotes that might be in the string
      const cleanDate = dateString.replace(/"/g, "");
      const date = new Date(cleanDate);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date not available";
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await toggleLike({ variables: { postId } });
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handlePostCreated = () => {
    setIsCreateFormOpen(false);
    refetch();
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
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-purple-200">Posts</h1>
          <button
            onClick={() => setIsCreateFormOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Create Post
          </button>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={`post-${post.id}`}
              className="bg-gray-800 rounded-lg p-6 shadow-lg border border-purple-500/20"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-purple-200 mb-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Posted by {post.author.name || post.author.email} on{" "}
                    {formatDate(post.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
                    post.likedBy.some((liker) => liker.id === user.id)
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{post.likes}</span>
                </button>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">{post.body}</p>
            </div>
          ))}
        </div>
      </div>

      {isCreateFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <CreatePostForm
              onPostCreated={handlePostCreated}
              onCancel={() => setIsCreateFormOpen(false)}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}
