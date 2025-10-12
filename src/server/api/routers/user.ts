import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { users } from "@/server/db/schema";

export const userRouter = createTRPCRouter({
	updateProfile: protectedProcedure
		.input(
			z.object({
				name: z
					.string()
					.min(1, "Name is required")
					.max(255, "Name must be less than 255 characters"),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = Number.parseInt(ctx.session.user.id);

			const [updatedUser] = await ctx.db
				.update(users)
				.set({
					name: input.name,
				})
				.where(eq(users.id, userId))
				.returning();

			if (!updatedUser) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to update profile",
				});
			}

			return {
				id: updatedUser.id,
				name: updatedUser.name,
				email: updatedUser.email,
				image: updatedUser.image,
			};
		}),

	getProfile: protectedProcedure.query(async ({ ctx }) => {
		const userId = Number.parseInt(ctx.session.user.id);

		const user = await ctx.db.query.users.findFirst({
			where: eq(users.id, userId),
			columns: {
				id: true,
				name: true,
				email: true,
				image: true,
			},
		});

		if (!user) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "User not found",
			});
		}

		return user;
	}),
});
