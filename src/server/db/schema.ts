import { relations, sql } from "drizzle-orm";
import { index, pgTableCreator, primaryKey } from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `${name}`);

export const posts = createTable(
	"posts",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		name: d.varchar({ length: 256 }),
		createdById: d
			.integer()
			.notNull()
			.references(() => users.id),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("created_by_idx").on(t.createdById),
		index("name_idx").on(t.name),
	],
);

export const users = createTable("users", (d) => ({
	id: d.integer().notNull().primaryKey().generatedByDefaultAsIdentity(),
	name: d.varchar({ length: 255 }),
	email: d.varchar({ length: 255 }).notNull(),
	emailVerified: d
		.timestamp({
			mode: "date",
			withTimezone: true,
		})
		.default(sql`CURRENT_TIMESTAMP`),
	image: d.varchar({ length: 255 }),
}));

export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
	recipes: many(recipes),
}));

export const accounts = createTable(
	"accounts",
	(d) => ({
		id: d.integer().generatedByDefaultAsIdentity(),
		userId: d
			.integer()
			.notNull()
			.references(() => users.id),
		type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
		provider: d.varchar({ length: 255 }).notNull(),
		providerAccountId: d.varchar({ length: 255 }).notNull(),
		refresh_token: d.text(),
		access_token: d.text(),
		expires_at: d.integer(),
		token_type: d.varchar({ length: 255 }),
		scope: d.varchar({ length: 255 }),
		id_token: d.text(),
		session_state: d.varchar({ length: 255 }),
	}),
	(t) => [
		primaryKey({ columns: [t.provider, t.providerAccountId] }),
		index("account_user_id_idx").on(t.userId),
	],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
	"sessions",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		sessionToken: d.varchar({ length: 255 }).notNull(),
		userId: d
			.integer()
			.notNull()
			.references(() => users.id),
		expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
	}),
	(t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
	"verification_token",
	(d) => ({
		identifier: d.varchar({ length: 255 }).notNull(),
		token: d.varchar({ length: 255 }).notNull(),
		expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
	}),
	(t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

export const recipes = createTable(
	"recipes",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		title: d.varchar({ length: 255 }).notNull(),
		description: d.text(),
		servings: d.integer(),
		prepTimeMinutes: d.integer(),
		cookTimeMinutes: d.integer(),
		difficulty: d.varchar({ length: 20 }),
		imageUrl: d.varchar({ length: 500 }),
		createdById: d
			.integer()
			.notNull()
			.references(() => users.id),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("recipe_created_by_idx").on(t.createdById),
		index("recipe_title_idx").on(t.title),
	],
);

export const ingredients = createTable(
	"ingredients",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		recipeId: d
			.integer()
			.notNull()
			.references(() => recipes.id, { onDelete: "cascade" }),
		name: d.varchar({ length: 255 }).notNull(),
		amount: d.varchar({ length: 50 }),
		unit: d.varchar({ length: 50 }),
		notes: d.text(),
		order: d.integer().notNull().default(0),
	}),
	(t) => [
		index("ingredient_recipe_idx").on(t.recipeId),
		index("ingredient_order_idx").on(t.recipeId, t.order),
	],
);

export const recipeSteps = createTable(
	"recipe_steps",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		recipeId: d
			.integer()
			.notNull()
			.references(() => recipes.id, { onDelete: "cascade" }),
		stepNumber: d.integer().notNull(),
		instruction: d.text().notNull(),
		timeMinutes: d.integer(),
		temperature: d.varchar({ length: 50 }),
		notes: d.text(),
	}),
	(t) => [
		index("step_recipe_idx").on(t.recipeId),
		index("step_order_idx").on(t.recipeId, t.stepNumber),
	],
);

export const tags = createTable(
	"tags",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		name: d.varchar({ length: 100 }).notNull().unique(),
		type: d.varchar({ length: 20 }).notNull(),
		color: d.varchar({ length: 7 }),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	}),
	(t) => [index("tag_name_idx").on(t.name), index("tag_type_idx").on(t.type)],
);

export const recipeTags = createTable(
	"recipe_tags",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		recipeId: d
			.integer()
			.notNull()
			.references(() => recipes.id, { onDelete: "cascade" }),
		tagId: d
			.integer()
			.notNull()
			.references(() => tags.id, { onDelete: "cascade" }),
	}),
	(t) => [
		index("recipe_tag_recipe_idx").on(t.recipeId),
		index("recipe_tag_tag_idx").on(t.tagId),
	],
);

export const recipesRelations = relations(recipes, ({ one, many }) => ({
	createdBy: one(users, {
		fields: [recipes.createdById],
		references: [users.id],
	}),
	ingredients: many(ingredients),
	steps: many(recipeSteps),
	recipeTags: many(recipeTags),
}));

export const ingredientsRelations = relations(ingredients, ({ one }) => ({
	recipe: one(recipes, {
		fields: [ingredients.recipeId],
		references: [recipes.id],
	}),
}));

export const recipeStepsRelations = relations(recipeSteps, ({ one }) => ({
	recipe: one(recipes, {
		fields: [recipeSteps.recipeId],
		references: [recipes.id],
	}),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
	recipeTags: many(recipeTags),
}));

export const recipeTagsRelations = relations(recipeTags, ({ one }) => ({
	recipe: one(recipes, {
		fields: [recipeTags.recipeId],
		references: [recipes.id],
	}),
	tag: one(tags, { fields: [recipeTags.tagId], references: [tags.id] }),
}));
