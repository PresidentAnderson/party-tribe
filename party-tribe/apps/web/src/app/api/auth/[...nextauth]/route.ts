import NextAuth from "next-auth";

import { authOptions } from "@party-tribe/api";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };