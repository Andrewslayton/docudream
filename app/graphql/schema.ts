import { gql } from "graphql-tag";

export const typeDefs = gql`
  type User {
    id: ID!
    name: String
    email: String!
    createdAt: String!
    updatedAt: String!
    posts: [Post!]!
    followers: [User!]!
    following: [User!]!
    likedPosts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    createdAt: String!
    updatedAt: String!
    likes: Int!
    author: User!
    likedBy: [User!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type FollowResponse {
    success: Boolean!
    message: String!
    id: ID
    followers: [User!]
  }

  type LikeResponse {
    success: Boolean!
    message: String!
    liked: Boolean!
  }

  type Query {
    me: User
    posts: [Post!]!
    searchUsers(query: String!): [User!]!
    user(id: ID!): User
  }

  type Mutation {
    register(name: String, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createPost(title: String!, body: String!): Post!
    followUser(userId: ID!): FollowResponse!
    unfollowUser(followingId: ID!): FollowResponse!
    toggleLike(postId: String!): LikeResponse!
  }
`;
