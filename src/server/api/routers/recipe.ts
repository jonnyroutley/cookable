import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import {
	ingredients,
	recipeSteps,
	recipes,
	recipeTags,
	tags,
} from "@/server/db/schema";

const ingredientSchema = z.object({
	name: z.string().min(1),
	amount: z.string().optional(),
	unit: z.string().optional(),
	notes: z.string().optional(),
	order: z.number().int().min(0).default(0),
});

const recipeStepSchema = z.object({
	stepNumber: z.number().int().min(1),
	instruction: z.string().min(1),
	timeMinutes: z.number().int().min(0).optional(),
	temperature: z.string().optional(),
	notes: z.string().optional(),
});

const createRecipeSchema = z.object({
	title: z.string().min(1).max(255),
	description: z.string().optional(),
	servings: z.number().int().min(1).optional(),
	prepTimeMinutes: z.number().int().min(0).optional(),
	cookTimeMinutes: z.number().int().min(0).optional(),
	difficulty: z.enum(["easy", "medium", "hard"]).optional(),
	imageUrl: z.string().url().optional().or(z.literal("")),
	ingredients: z.array(ingredientSchema).min(1),
	steps: z.array(recipeStepSchema).min(1),
	tagIds: z.array(z.number().int()).default([]),
});

const updateRecipeSchema = createRecipeSchema.extend({
	id: z.number().int(),
});

export const recipeRouter = createTRPCRouter({
	create: protectedProcedure
		.input(createRecipeSchema)
		.mutation(async ({ ctx, input }) => {
			const userId = Number.parseInt(ctx.session.user.id);

			return await ctx.db.transaction(async (tx) => {
				const [recipe] = await tx
					.insert(recipes)
					.values({
						title: input.title,
						description: input.description,
						servings: input.servings,
						prepTimeMinutes: input.prepTimeMinutes,
						cookTimeMinutes: input.cookTimeMinutes,
						difficulty: input.difficulty,
						imageUrl: input.imageUrl || null,
						createdById: userId,
					})
					.returning();

				if (!recipe) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to create recipe",
					});
				}

				if (input.ingredients.length > 0) {
					await tx.insert(ingredients).values(
						input.ingredients.map((ingredient) => ({
							recipeId: recipe.id,
							name: ingredient.name,
							amount: ingredient.amount,
							unit: ingredient.unit,
							notes: ingredient.notes,
							order: ingredient.order,
						})),
					);
				}

				if (input.steps.length > 0) {
					await tx.insert(recipeSteps).values(
						input.steps.map((step) => ({
							recipeId: recipe.id,
							stepNumber: step.stepNumber,
							instruction: step.instruction,
							timeMinutes: step.timeMinutes,
							temperature: step.temperature,
							notes: step.notes,
						})),
					);
				}

				if (input.tagIds.length > 0) {
					await tx.insert(recipeTags).values(
						input.tagIds.map((tagId) => ({
							recipeId: recipe.id,
							tagId,
						})),
					);
				}

				return recipe;
			});
		}),

	update: protectedProcedure
		.input(updateRecipeSchema)
		.mutation(async ({ ctx, input }) => {
			const userId = Number.parseInt(ctx.session.user.id);

			const existingRecipe = await ctx.db.query.recipes.findFirst({
				where: eq(recipes.id, input.id),
			});

			if (!existingRecipe) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Recipe not found",
				});
			}

			if (existingRecipe.createdById !== userId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only update your own recipes",
				});
			}

			return await ctx.db.transaction(async (tx) => {
				const [updatedRecipe] = await tx
					.update(recipes)
					.set({
						title: input.title,
						description: input.description,
						servings: input.servings,
						prepTimeMinutes: input.prepTimeMinutes,
						cookTimeMinutes: input.cookTimeMinutes,
						difficulty: input.difficulty,
						imageUrl: input.imageUrl || null,
					})
					.where(eq(recipes.id, input.id))
					.returning();

				await tx.delete(ingredients).where(eq(ingredients.recipeId, input.id));
				await tx.delete(recipeSteps).where(eq(recipeSteps.recipeId, input.id));
				await tx.delete(recipeTags).where(eq(recipeTags.recipeId, input.id));

				if (input.ingredients.length > 0) {
					await tx.insert(ingredients).values(
						input.ingredients.map((ingredient) => ({
							recipeId: input.id,
							name: ingredient.name,
							amount: ingredient.amount,
							unit: ingredient.unit,
							notes: ingredient.notes,
							order: ingredient.order,
						})),
					);
				}

				if (input.steps.length > 0) {
					await tx.insert(recipeSteps).values(
						input.steps.map((step) => ({
							recipeId: input.id,
							stepNumber: step.stepNumber,
							instruction: step.instruction,
							timeMinutes: step.timeMinutes,
							temperature: step.temperature,
							notes: step.notes,
						})),
					);
				}

				if (input.tagIds.length > 0) {
					await tx.insert(recipeTags).values(
						input.tagIds.map((tagId) => ({
							recipeId: input.id,
							tagId,
						})),
					);
				}

				return updatedRecipe;
			});
		}),

	getById: publicProcedure
		.input(z.object({ id: z.number().int() }))
		.query(async ({ ctx, input }) => {
			const recipe = await ctx.db.query.recipes.findFirst({
				where: eq(recipes.id, input.id),
				with: {
					createdBy: {
						columns: {
							id: true,
							name: true,
							image: true,
						},
					},
					ingredients: {
						orderBy: (ingredients, { asc }) => [asc(ingredients.order)],
					},
					steps: {
						orderBy: (steps, { asc }) => [asc(steps.stepNumber)],
					},
					recipeTags: {
						with: {
							tag: true,
						},
					},
				},
			});

			if (!recipe) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Recipe not found",
				});
			}

			return {
				...recipe,
				tags: recipe.recipeTags.map((rt) => rt.tag),
			};
		}),

	getAll: publicProcedure
		.input(
			z.object({
				limit: z.number().int().min(1).max(100).default(20),
				cursor: z.number().int().optional(),
				tagIds: z.array(z.number().int()).optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { limit = 20, cursor, tagIds } = input;

			const recipeResults = await ctx.db.query.recipes.findMany({
				limit: limit + 1,
				where: cursor ? eq(recipes.id, cursor) : undefined,
				orderBy: (recipesTable, { desc }) => [desc(recipesTable.createdAt)],
				with: {
					createdBy: {
						columns: {
							id: true,
							name: true,
							image: true,
						},
					},
					recipeTags: tagIds
						? {
								with: {
									tag: true,
								},
								where: (recipeTags, { inArray }) =>
									inArray(recipeTags.tagId, tagIds),
							}
						: {
								with: {
									tag: true,
								},
							},
				},
			});

			let nextCursor: number | undefined;
			if (recipeResults.length > limit) {
				const nextItem = recipeResults.pop();
				// biome-ignore lint/style/noNonNullAssertion: it's ok
				nextCursor = nextItem!.id;
			}

			return {
				recipes: recipeResults.map((recipe) => ({
					...recipe,
					tags: recipe.recipeTags.map((rt) => rt.tag),
				})),
				nextCursor,
			};
		}),

	getTags: publicProcedure.query(async ({ ctx }) => {
		const allTags = await ctx.db.query.tags.findMany({
			orderBy: (tags, { asc }) => [asc(tags.name)],
		});

		return allTags;
	}),

	createTag: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1).max(100),
				type: z.enum(["cuisine", "allergen", "diet", "meal", "other"]),
				color: z.string().length(7).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [tag] = await ctx.db
				.insert(tags)
				.values({
					name: input.name,
					type: input.type,
					color: input.color,
				})
				.returning();

			return tag;
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.number().int() }))
		.mutation(async ({ ctx, input }) => {
			const userId = Number.parseInt(ctx.session.user.id);

			const existingRecipe = await ctx.db.query.recipes.findFirst({
				where: eq(recipes.id, input.id),
			});

			if (!existingRecipe) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Recipe not found",
				});
			}

			if (existingRecipe.createdById !== userId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only delete your own recipes",
				});
			}

			await ctx.db.delete(recipes).where(eq(recipes.id, input.id));

			return { success: true };
		}),
});
