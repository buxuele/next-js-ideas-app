import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { sql } from "@vercel/postgres";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" && profile) {
        try {
          // Check if user exists
          const existingUser = await sql`
            SELECT id FROM users WHERE github_id = ${profile.id}
          `;

          if (existingUser.rows.length === 0) {
            // Create new user
            await sql`
              INSERT INTO users (github_id, username, display_name, email, avatar_url)
              VALUES (${profile.id}, ${profile.login}, ${
              profile.name || profile.login
            }, ${profile.email}, ${profile.avatar_url})
            `;
          } else {
            // Update existing user info
            await sql`
              UPDATE users 
              SET username = ${profile.login}, 
                  display_name = ${profile.name || profile.login},
                  email = ${profile.email},
                  avatar_url = ${profile.avatar_url},
                  updated_at = NOW()
              WHERE github_id = ${profile.id}
            `;
          }
          return true;
        } catch (error) {
          console.error("Error handling user sign in:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        try {
          const result = await sql`
            SELECT id, username, display_name, avatar_url 
            FROM users 
            WHERE email = ${session.user.email}
          `;

          if (result.rows.length > 0) {
            const user = result.rows[0];
            session.user.id = user.id;
            session.user.username = user.username;
            session.user.displayName = user.display_name;
            session.user.image = user.avatar_url;
          }
        } catch (error) {
          console.error("Error fetching user session:", error);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
