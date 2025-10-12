"use client";

import { ChefHat, Clock, Plus, Search, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

function RecipeCardSkeleton() {
	return (
		<Card>
			<CardHeader>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start">
					<div className="flex-1 space-y-2">
						<Skeleton className="h-6 w-3/4" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-2/3" />
					</div>
					<Skeleton className="h-24 w-24 sm:h-20 sm:w-20" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="mb-3 flex flex-wrap gap-2">
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-4 w-14" />
				</div>
				<div className="flex flex-wrap gap-1">
					<Skeleton className="h-5 w-12" />
					<Skeleton className="h-5 w-16" />
					<Skeleton className="h-5 w-14" />
				</div>
			</CardContent>
		</Card>
	);
}

function RecipeCard({
	recipe,
}: {
	recipe: {
		id: number;
		title: string;
		description: string | null;
		servings: number | null;
		prepTimeMinutes: number | null;
		cookTimeMinutes: number | null;
		difficulty: string | null;
		imageUrl: string | null;
		createdBy: {
			id: number;
			name: string | null;
			image: string | null;
		};
		tags: Array<{
			id: number;
			name: string;
			type: string;
			color: string | null;
		}>;
	};
}) {
	const totalTime =
		(recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

	return (
		<Link href={`/recipe/${recipe.id}`}>
			<Card className="cursor-pointer transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
				<CardHeader>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start">
						<div className="flex-1">
							<CardTitle className="mb-2 line-clamp-2 font-heading text-lg">
								{recipe.title}
							</CardTitle>
							{recipe.description && (
								<CardDescription className="line-clamp-2">
									{recipe.description}
								</CardDescription>
							)}
						</div>
						{recipe.imageUrl ? (
							<div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-base border-2 border-border bg-secondary-background sm:h-20 sm:w-20">
								Images coming soon
								{/* <Image
									src={recipe.imageUrl}
									alt={recipe.title}
									width={80}
									height={80}
									className="h-full w-full object-cover"
								/> */}
							</div>
						) : (
							<div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-base border-2 border-border bg-secondary-background sm:h-20 sm:w-20">
								<ChefHat className="h-8 w-8 " />
							</div>
						)}
					</div>
				</CardHeader>
				<CardContent>
					{/* Recipe Meta Info */}
					<div className="mb-3 flex flex-wrap gap-3  text-sm">
						{recipe.servings && (
							<div className="flex items-center gap-1">
								<Users className="h-3 w-3" />
								<span>{recipe.servings}</span>
							</div>
						)}
						{totalTime > 0 && (
							<div className="flex items-center gap-1">
								<Clock className="h-3 w-3" />
								<span>{totalTime}m</span>
							</div>
						)}
						{recipe.difficulty && (
							<div className="flex items-center gap-1">
								<ChefHat className="h-3 w-3" />
								<span className="capitalize">{recipe.difficulty}</span>
							</div>
						)}
					</div>

					{/* Tags */}
					{recipe.tags && recipe.tags.length > 0 && (
						<div className="mb-2 flex flex-wrap gap-1">
							{recipe.tags.slice(0, 3).map((tag) => (
								<Badge
									key={tag.id}
									variant={tag.type === "allergen" ? "neutral" : "default"}
									className="text-xs"
								>
									{tag.name}
								</Badge>
							))}
							{recipe.tags.length > 3 && (
								<Badge variant="neutral" className="text-xs">
									+{recipe.tags.length - 3} more
								</Badge>
							)}
						</div>
					)}

					{/* Author */}
					<div className=" text-xs">
						by {recipe.createdBy.name}
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}

export default function RecipesPage() {
	const [searchQuery, setSearchQuery] = useState("");

	const {
		data,
		isLoading,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = api.recipe.getAll.useInfiniteQuery(
		{
			limit: 12,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		},
	);

	const allRecipes = data?.pages.flatMap((page) => page.recipes) ?? [];

	// Simple client-side search filter
	const filteredRecipes = allRecipes.filter(
		(recipe) =>
			recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			recipe.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			recipe.tags.some((tag) =>
				tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
			),
	);

	return (
		<div className="container mx-auto max-w-6xl p-4">
			{/* Header */}
			<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="mb-2 font-heading text-2xl sm:text-3xl">
						All Recipes
					</h1>
					<p className="">
						Discover delicious recipes from our community
					</p>
				</div>
				<Link href="/recipe/new">
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						Add Recipe
					</Button>
				</Link>
			</div>

			{/* Search */}
			<div className="relative mb-6">
				<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform " />
				<Input
					placeholder="Search recipes, ingredients, tags..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="pl-10"
				/>
			</div>

			{/* Loading State */}
			{isLoading && (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: don't care
						<RecipeCardSkeleton key={i} />
					))}
				</div>
			)}

			{/* Error State */}
			{error && (
				<Card>
					<CardContent className="p-8 text-center">
						<h2 className="mb-2 font-heading text-xl">Something went wrong</h2>
						<p className="">
							Unable to load recipes. Please try again later.
						</p>
					</CardContent>
				</Card>
			)}

			{/* Empty State */}
			{!isLoading && !error && filteredRecipes.length === 0 && (
				<Card>
					<CardContent className="p-8 text-center">
						<ChefHat className="mx-auto mb-4 h-12 w-12 " />
						<h2 className="mb-2 font-heading text-xl">
							{searchQuery ? "No recipes found" : "No recipes yet"}
						</h2>
						<p className="mb-4 ">
							{searchQuery
								? `No recipes match "${searchQuery}". Try a different search term.`
								: "Be the first to share a delicious recipe with the community!"}
						</p>
						{!searchQuery && (
							<Link href="/recipe/new">
								<Button>
									<Plus className="mr-2 h-4 w-4" />
									Create First Recipe
								</Button>
							</Link>
						)}
					</CardContent>
				</Card>
			)}

			{/* Recipe Grid */}
			{!isLoading && !error && filteredRecipes.length > 0 && (
				<>
					<div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{filteredRecipes.map((recipe) => (
							<RecipeCard key={recipe.id} recipe={recipe} />
						))}
					</div>

					{/* Load More */}
					{hasNextPage && !searchQuery && (
						<div className="text-center">
							<Button
								variant="neutral"
								onClick={() => fetchNextPage()}
								disabled={isFetchingNextPage}
							>
								{isFetchingNextPage ? "Loading..." : "Load More Recipes"}
							</Button>
						</div>
					)}

					{/* Search Results Info */}
					{searchQuery && (
						<div className="text-center  text-sm">
							Found {filteredRecipes.length} recipe
							{filteredRecipes.length === 1 ? "" : "s"} for "{searchQuery}"
						</div>
					)}
				</>
			)}
		</div>
	);
}
