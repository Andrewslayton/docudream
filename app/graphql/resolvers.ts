import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const resolvers = {
  Query: {
    me: async (_: any, __: any, { user }: { user: any }) => {
      if (!user) return null;
      return prisma.user.findUnique({ where: { id: user.id } });
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
  },
};
