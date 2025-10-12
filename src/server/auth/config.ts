import PostgresAdapter from "@auth/pg-adapter";
import { Pool } from "@neondatabase/serverless";
import type { DefaultSession, NextAuthConfig } from "next-auth";
import Resend from "next-auth/providers/resend";
import { env } from "@/env";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
	interface Session extends DefaultSession {
		user: {
			id: string;
			// ...other properties
			// role: UserRole;
		} & DefaultSession["user"];
	}

	// interface User {
	//   // ...other properties
	//   // role: UserRole;
	// }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = () => {
	const pool = new Pool({ connectionString: env.DATABASE_URL });
	return {
		providers: [Resend({ from: "NoReply <noreply@cookable.health>" })],
		adapter: PostgresAdapter(pool),
		// callbacks: {
		// 	session: ({ session, user }) => ({
		// 		...session,
		// 		user: {
		// 			...session.user,
		// 			id: user.id,
		// 		},
		// 	}),
		// },
	} satisfies NextAuthConfig;
};
