import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { typeDefs } from "@/app/graphql/schema";
import { resolvers } from "@/app/graphql/resolvers";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextRequest) => {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return { user: null };

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return { user: { id: decoded.userId } };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return { user: null };
    }
  },
});

export { handler as GET, handler as POST };
