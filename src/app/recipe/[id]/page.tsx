"use client";

import { ChefHat, Clock, Tag, Users, X } from "lucide-react";
import { useParams } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { Slider } from "@/components/ui/slider";

function Divider() {
	return <div className="mt-4 border-border border-t-2 pt-4" />;
}

function RecipeSkeleton() {
	return (
		<div className="container mx-auto p-4">
			<Card className="mb-6">
				<CardHeader>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div className="flex-1">
							<Skeleton className="mb-2 h-8 w-3/4" />
							<Skeleton className="h-5 w-full" />
							<Skeleton className="h-5 w-2/3" />
						</div>
						<Skeleton className="h-48 w-full sm:h-48 sm:w-48" />
					</div>
				</CardHeader>
				<CardContent>
					{/* Meta info skeletons */}
					<div className="mb-4 flex flex-wrap gap-4">
						<Skeleton className="h-5 w-20" />
						<Skeleton className="h-5 w-16" />
						<Skeleton className="h-5 w-18" />
						<Skeleton className="h-5 w-24" />
					</div>

					{/* Tags skeleton */}
					<div className="mb-4 flex flex-wrap gap-2">
						<Skeleton className="h-6 w-16" />
						<Skeleton className="h-6 w-12" />
						<Skeleton className="h-6 w-20" />
					</div>

					<div className="mt-4 border-border border-t-2 pt-4" />

					{/* Ingredients section */}
					<div className="mb-4">
						<Skeleton className="mb-4 h-7 w-32" />
						<div className="space-y-3">
							{Array.from({ length: 6 }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: fine
								<div key={i} className="ml-3 flex items-start gap-3">
									<Skeleton className="h-5 w-5" />
									<Skeleton className="h-5 w-32" />
								</div>
							))}
						</div>
					</div>

					<div className="mt-4 border-border border-t-2 pt-4" />

					{/* Instructions section */}
					<div>
						<Skeleton className="mb-4 h-7 w-32" />
						<div className="space-y-4">
							{Array.from({ length: 4 }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: fine
								<div key={i} className="flex items-center gap-3">
									<Skeleton className="h-8 w-8 rounded-full" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-5 w-32" />
									</div>
								</div>
							))}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default function RecipePage() {
	const params = useParams();
	const recipeId = Number.parseInt(params.id as string);
	const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
	const [mouthsToFeed, setMouthsToFeed] = useState<[number]>([4]);

	const {
		data: recipe,
		isLoading,
		error,
	} = api.recipe.getById.useQuery({ id: recipeId });

	const multiplier = mouthsToFeed[0] / (recipe?.servings ?? 4);

	const toggleIngredient = (ingredientId: number) => {
		setCheckedIngredients((prev) =>
			prev.includes(ingredientId)
				? prev.filter((id) => id !== ingredientId)
				: [...prev, ingredientId],
		);
	};

	const clearAllIngredients = () => {
		setCheckedIngredients([]);
	};

	if (isLoading) {
		return <RecipeSkeleton />;
	}

	if (error || !recipe) {
		return (
			<div className="container mx-auto p-4">
				<Card className="bg-white">
					<CardContent className="p-8 text-center">
						<h2 className="mb-2 font-heading text-xl">Recipe not found</h2>
						<p className="">The recipe you're looking for doesn't exist.</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	const totalTime =
		(recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

	return (
		<div className="container mx-auto p-4">
			{/* Recipe Header */}
			<Card className="">
				<CardHeader>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div className="flex-1">
							<CardTitle className="mb-2 font-heading text-2xl sm:text-3xl">
								{recipe.title}
							</CardTitle>
							{recipe.description && (
								<CardDescription className="text-base">
									{recipe.description}
								</CardDescription>
							)}
						</div>
						{recipe.imageUrl && (
							<div className="flex h-48 w-full items-center overflow-hidden rounded-base border-2 border-border bg-secondary-background text-center sm:w-48">
								Image support coming soon
								{/* <Image
									src={recipe.imageUrl}
									alt={recipe.title}
									width={192}
									height={192}
									className="h-full w-full object-cover"
								/> */}
							</div>
						)}
					</div>
				</CardHeader>
				<CardContent className="">
					{/* Recipe Meta Info */}
					<div className="mb-4 flex flex-wrap gap-4">
						<div className="flex items-center gap-2">
							<Users className="h-4 w-4 " />
							<span className="font-base text-sm">
								{(recipe.servings ?? 4) * multiplier} servings
							</span>
						</div>
						{recipe.prepTimeMinutes && (
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4 " />
								<span className="font-base text-sm">
									{recipe.prepTimeMinutes}m prep
								</span>
							</div>
						)}
						{recipe.cookTimeMinutes && (
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4 " />
								<span className="font-base text-sm">
									{recipe.cookTimeMinutes}m cook
								</span>
							</div>
						)}
						{totalTime > 0 && (
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4 " />
								<span className="font-base font-bold text-sm">
									{totalTime}m total
								</span>
							</div>
						)}
						{recipe.difficulty && (
							<div className="flex items-center gap-2">
								<ChefHat className="h-4 w-4 " />
								<span className="font-base text-sm capitalize">
									{recipe.difficulty}
								</span>
							</div>
						)}
						<p className=" text-sm">
							Created by{" "}
							<span className="font-heading">{recipe.createdBy.name}</span>
						</p>
					</div>
					{/* Tags */}
					{recipe.tags && recipe.tags.length > 0 && (
						<div className="flex flex-wrap items-center gap-2">
							<Tag className="h-4 w-4" />
							{recipe.tags.map((tag) => {
								// TODO: tag color won't work here yet
								return (
									<Badge
										key={tag.id}
										variant="neutral"
										className={tag.color ? `bg-${tag.color}` : ""}
									>
										{tag.name}
									</Badge>
								);
							})}
						</div>
					)}
					<Divider />
					How many people are you cooking for?
					<div className="flex w-full items-center gap-2">
						<Slider
							value={mouthsToFeed}
							min={1}
							max={35}
							step={1}
							onValueChange={(value) => setMouthsToFeed(value as [number])}
						/>
						{mouthsToFeed[0]}
					</div>
					<Divider />
					<div className="mb-4 flex items-center justify-between">
						<h2 className="h-8 font-heading text-xl">Ingredients</h2>
						{checkedIngredients.length > 0 && (
							<Button
								size="sm"
								onClick={clearAllIngredients}
								className="h-8"
								variant={"neutral"}
							>
								<X className="mr-1 h-3 w-3" />
								Clear All
							</Button>
						)}
					</div>
					<ul className="space-y-3 ">
						{recipe.ingredients.map((ingredient) => (
							<li key={ingredient.id} className="ml-3 flex items-start gap-3 ">
								<Checkbox
									id={`ingredient-${ingredient.id}`}
									checked={checkedIngredients.includes(ingredient.id)}
									onCheckedChange={() => toggleIngredient(ingredient.id)}
									className="mt-0.5 bg-white"
								/>
								<div className="flex-1">
									<label
										htmlFor={`ingredient-${ingredient.id}`}
										className={`cursor-pointer font-base ${
											checkedIngredients.includes(ingredient.id)
												? " line-through"
												: ""
										}`}
									>
										{`${ingredient.amount ? Math.round(Number(ingredient.amount) * multiplier * 100) / 100 : ""} ${ingredient.unit ?? ""} ${ingredient.name}`}
									</label>
									{ingredient.notes && (
										<p
											className={`mt-1 text-sm ${
												checkedIngredients.includes(ingredient.id)
													? " line-through"
													: ""
											}`}
										>
											{ingredient.notes}
										</p>
									)}
								</div>
							</li>
						))}
					</ul>
					{recipe.ingredients.length > 0 && (
						<div className="mt-4 text-center">
							<p className=" text-sm">
								{checkedIngredients.length} of {recipe.ingredients.length}{" "}
								ingredients checked
							</p>
						</div>
					)}
					<Divider />
					<h2 className="mb-4 font-heading text-xl">Instructions</h2>
					<ol className="space-y-4">
						{recipe.steps.map((step) => (
							<li key={step.id} className="flex items-start gap-3">
								<span
									className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-white font-bold text-main-foreground text-sm `}
								>
									{step.stepNumber}
								</span>
								<div className="flex-1 pt-1">
									<p className={`font-base leading-relaxed`}>
										{step.instruction}
									</p>
								</div>
							</li>
						))}
					</ol>
				</CardContent>
			</Card>
		</div>
	);
}
