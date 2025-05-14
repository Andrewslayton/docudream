"use client";

import { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { useRouter } from "next/navigation";

const CREATE_POST = gql`
  mutation CreatePost($title: String!, $body: String!) {
    createPost(title: $title, body: $body) {
      id
      title
      body
      createdAt
      author {
        id
        name
      }
    }
  }
`;

interface CreatePostFormProps {
  onPostCreated: () => void;
}

export default function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const [createPost, { loading }] = useMutation(CREATE_POST, {
    onCompleted: () => {
      setTitle("");
      setBody("");
      setError("");
      onPostCreated();
    },
    onError: (error) => {
      if (error.message.includes("Not authenticated")) {
        router.push("/login");
      } else {
        setError(error.message);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !body.trim()) {
      setError("Please fill in all fields");
      return;
    }

    try {
      await createPost({
        variables: {
          title: title.trim(),
          body: body.trim(),
        },
      });
    } catch (error) {
      // Error is handled in onError callback
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-purple-200 mb-6">
        Create New Post
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500/20 rounded-lg">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-purple-200 mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-purple-500/20 rounded-lg text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter post title"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="body" className="block text-purple-200 mb-2">
            Content
          </label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-purple-500/20 rounded-lg text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[150px]"
            placeholder="Write your post content here..."
            disabled={loading}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => onPostCreated()}
            className="px-4 py-2 text-purple-200 hover:text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
