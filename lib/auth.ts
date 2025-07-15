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
    async signIn({ account, profile }) {
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
              VALUES (${String(profile.id)}, ${String(profile.login)}, ${String(
              profile.name || profile.login
            )}, ${String(profile.email || "")}, ${String(
              profile.avatar_url || ""
            )})
            `;
          } else {
            // Update existing user info
            await sql`
              UPDATE users 
              SET username = ${String(profile.login)}, 
                  display_name = ${String(profile.name || profile.login)},
                  email = ${String(profile.email || "")},
                  avatar_url = ${String(profile.avatar_url || "")},
                  updated_at = NOW()
              WHERE github_id = ${String(profile.id)}
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
    async session({ session }) {
      if (session.user?.email) {
        try {
          const result = await sql`
            SELECT id, username, display_name, avatar_url 
            FROM users 
            WHERE email = ${session.user.email}
          `;

          if (result.rows.length > 0) {
            const user = result.rows[0];
            session.user.id = user.id || "";
            session.user.username = user.username || "";
            session.user.displayName =
              user.display_name || session.user.name || "";
            session.user.image = user.avatar_url || session.user.image || null;
          } else {
            // If user not found in database, set default values
            session.user.id = "";
            session.user.username = session.user.name || "";
            session.user.displayName = session.user.name || "";
            // Keep original GitHub avatar if available
            session.user.image = session.user.image || null;
          }
        } catch (error) {
          console.error("Error fetching user session:", error);
          // Set fallback values on error
          session.user.id = "";
          session.user.username = session.user.name || "";
          session.user.displayName = session.user.name || "";
          // Keep original GitHub avatar if available
          session.user.image = session.user.image || null;
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
