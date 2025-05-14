"use client";

import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";

const SEARCH_USERS = gql`
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      id
      name
      email
    }
  }
`;

const FOLLOW_USER = gql`
  mutation FollowUser($userId: ID!) {
    followUser(userId: $userId) {
      id
      followers {
        id
      }
    }
  }
`;

const UNFOLLOW_USER = gql`
  mutation UnfollowUser($userId: ID!) {
    unfollowUser(userId: $userId) {
      id
      followers {
        id
      }
    }
  }
`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: searchData, loading: searchLoading } = useQuery(SEARCH_USERS, {
    variables: { query: searchQuery },
    skip: !searchQuery || searchQuery.length < 2,
  });

  const [followUser] = useMutation(FOLLOW_USER);
  const [unfollowUser] = useMutation(UNFOLLOW_USER);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleFollow = async (userId: string) => {
    try {
      await followUser({ variables: { userId } });
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      await unfollowUser({ variables: { userId } });
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  return (
    <nav className="bg-gray-800 border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-purple-200 text-xl font-bold">
                DocuDream
              </span>
            </Link>
          </div>

          {user ? (
            <div className="flex items-center space-x-4">
              <div className="relative" ref={searchRef}>
                <input
                  type="text"
                  placeholder="Search users..."
                  className="bg-gray-700 text-purple-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                />
                {isSearchOpen && searchQuery.length >= 2 && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 border border-purple-500/20 rounded-lg shadow-lg z-50">
                    {searchLoading ? (
                      <div className="p-4 text-purple-200">Loading...</div>
                    ) : searchData?.searchUsers?.length > 0 ? (
                      <div className="max-h-96 overflow-y-auto">
                        {searchData.searchUsers.map((user: any) => (
                          <div
                            key={user.id}
                            className="p-4 hover:bg-gray-700 border-b border-purple-500/20 last:border-b-0"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-purple-200 font-medium">
                                  {user.name}
                                </p>
                                <p className="text-purple-400 text-sm">
                                  {user.email}
                                </p>
                              </div>
                              <button
                                onClick={() => handleFollow(user.id)}
                                className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              >
                                Follow
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-purple-200">No users found</div>
                    )}
                  </div>
                )}
              </div>

              <Link
                href="/posts"
                className="text-purple-200 hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium"
              >
                Posts
              </Link>

              <Link
                href="/following"
                className="text-purple-200 hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium"
              >
                Following
              </Link>

              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center text-purple-200 hover:text-purple-300 focus:outline-none"
                >
                  <span className="mr-2">{user.name}</span>
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-purple-500/20 rounded-lg shadow-lg z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-purple-200 hover:bg-gray-700"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-purple-200 hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-purple-200 hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
