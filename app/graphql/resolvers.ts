import { PrismaClient } from "../../app/generated/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const resolvers = {
  Query: {
    me: async (_: any, __: any, { user }: { user: { id: string } | null }) => {
      if (!user) throw new Error("Not authenticated");
      return prisma.user.findUnique({
        where: { id: user.id },
        include: {
          posts: true,
          followers: true,
          following: true,
        },
      });
    },
    posts: async () => {
      return prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        include: { author: true },
      });
    },
    searchUsers: async (_: any, { query }: { query: string }) => {
      return prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 10,
      });
    },
    user: async (_: any, { id }: { id: string }) => {
      return prisma.user.findUnique({
        where: { id },
        include: {
          posts: true,
          followers: true,
          following: true,
        },
      });
    },
  },
  Mutation: {
    register: async (
      _: any,
      {
        email,
        password,
        name,
      }: { email: string; password: string; name?: string }
    ) => {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new Error("User already exists");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      return { token, user };
    },
    login: async (
      _: any,
      { email, password }: { email: string; password: string }
    ) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new Error("No user found with this email");
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error("Invalid password");
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      return { token, user };
    },
    createPost: async (
      _: any,
      { title, body }: { title: string; body: string },
      { user }: { user: { id: string } | null }
    ) => {
      if (!user) {
        throw new Error("Not authenticated");
      }

      return prisma.post.create({
        data: {
          title,
          body,
          authorId: user.id,
        },
        include: { author: true },
      });
    },
    followUser: async (
      _: any,
      { followingId }: { followingId: string },
      { user }: { user: { id: string } | null }
    ) => {
      if (!user) throw new Error("Not authenticated");
      if (user.id === followingId) throw new Error("Cannot follow yourself");

      // Check if already following
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId,
          },
        },
      });

      if (existingFollow) {
        return { success: false, message: "Already following this user" };
      }

      try {
        await prisma.follow.create({
          data: {
            follower: { connect: { id: user.id } },
            following: { connect: { id: followingId } },
          },
        });
        return { success: true, message: "Successfully followed user" };
      } catch (error) {
        console.error("Follow error:", error);
        return { success: false, message: "Failed to follow user" };
      }
    },
    unfollowUser: async (
      _: any,
      { followingId }: { followingId: string },
      { user }: { user: { id: string } | null }
    ) => {
      if (!user) throw new Error("Not authenticated");

      try {
        await prisma.follow.delete({
          where: {
            followerId_followingId: {
              followerId: user.id,
              followingId,
            },
          },
        });
        return { success: true, message: "Successfully unfollowed user" };
      } catch (error) {
        console.error("Unfollow error:", error);
        return { success: false, message: "Failed to unfollow user" };
      }
    },
  },
  User: {
    followers: async (parent: { id: string }) => {
      return prisma.follow
        .findMany({
          where: { followingId: parent.id },
          include: { follower: true },
        })
        .then((follows) => follows.map((follow) => follow.follower));
    },
    following: async (parent: { id: string }) => {
      return prisma.follow
        .findMany({
          where: { followerId: parent.id },
          include: { following: true },
        })
        .then((follows) => follows.map((follow) => follow.following));
    },
  },
};
