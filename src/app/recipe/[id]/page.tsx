"use client";

import { ChefHat, Clock, Tag, Users, X } from "lucide-react";
import Image from "next/image";
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

function Divider() {
	return <div className="mt-4 border-border border-t-2 pt-4" />;
}

function SkeletonCard() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className="h-6 w-24" />
			</CardHeader>
		</Card>
	);
}

export default function RecipePage() {
	const params = useParams();
	const recipeId = Number.parseInt(params.id as string);
	const [checkedSteps, setCheckedSteps] = useState<number[]>([]);
	const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);

	const {
		data: recipe,
		isLoading,
		error,
	} = api.recipe.getById.useQuery({ id: recipeId });

	const toggleStep = (stepNumber: number) => {
		setCheckedSteps((prev) =>
			prev.includes(stepNumber)
				? prev.filter((step) => step !== stepNumber)
				: [...prev, stepNumber],
		);
	};

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
		return <SkeletonCard />;
	}

	if (error || !recipe) {
		return (
			<div className="container mx-auto p-4">
				<Card>
					<CardContent className="p-8 text-center">
						<h2 className="mb-2 font-heading text-xl">Recipe not found</h2>
						<p className="text-foreground/70">
							The recipe you're looking for doesn't exist.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	const totalTime =
		(recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

	return (
		<>
			{/* Recipe Header */}
			<Card className="mb-6">
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
							<div className="h-48 w-full overflow-hidden rounded-base border-2 border-border bg-secondary-background sm:w-48">
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
				<CardContent>
					{/* Recipe Meta Info */}
					<div className="mb-4 flex flex-wrap gap-4">
						{recipe.servings && (
							<div className="flex items-center gap-2">
								<Users className="h-4 w-4" />
								<span className="font-base text-sm">
									{recipe.servings} servings
								</span>
							</div>
						)}
						{recipe.prepTimeMinutes && (
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4" />
								<span className="font-base text-sm">
									{recipe.prepTimeMinutes}m prep
								</span>
							</div>
						)}
						{recipe.cookTimeMinutes && (
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4" />
								<span className="font-base text-sm">
									{recipe.cookTimeMinutes}m cook
								</span>
							</div>
						)}
						{totalTime > 0 && (
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4" />
								<span className="font-base font-bold text-sm">
									{totalTime}m total
								</span>
							</div>
						)}
						{recipe.difficulty && (
							<div className="flex items-center gap-2">
								<ChefHat className="h-4 w-4" />
								<span className="font-base text-sm capitalize">
									{recipe.difficulty}
								</span>
							</div>
						)}
						<p className="text-foreground/70 text-sm">
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
										variant={tag.type === "allergen" ? "neutral" : "default"}
										className={tag.color ? `bg-${tag.color}` : ""}
									>
										{tag.name}
									</Badge>
								);
							})}
						</div>
					)}

					<Divider />

					<div className="mb-4 flex items-center justify-between">
						<h2 className="h-8 font-heading text-xl">Ingredients</h2>
						{checkedIngredients.length > 0 && (
							<Button
								variant="neutral"
								size="sm"
								onClick={clearAllIngredients}
								className="h-8"
							>
								<X className="mr-1 h-3 w-3" />
								Clear All
							</Button>
						)}
					</div>

					<ul className="space-y-3">
						{recipe.ingredients.map((ingredient) => (
							<li key={ingredient.id} className="ml-3 flex items-start gap-3 ">
								<Checkbox
									id={`ingredient-${ingredient.id}`}
									checked={checkedIngredients.includes(ingredient.id)}
									onCheckedChange={() => toggleIngredient(ingredient.id)}
									className="mt-0.5"
								/>
								<div className="flex-1">
									<label
										htmlFor={`ingredient-${ingredient.id}`}
										className={`cursor-pointer font-base ${
											checkedIngredients.includes(ingredient.id)
												? "text-foreground/50 line-through"
												: ""
										}`}
									>
										{ingredient.amount && ingredient.unit
											? `${ingredient.amount} ${ingredient.unit}`
											: ingredient.amount || ""}
										{ingredient.amount || ingredient.unit ? " " : ""}
										{ingredient.name}
									</label>
									{ingredient.notes && (
										<p
											className={`mt-1 text-sm ${
												checkedIngredients.includes(ingredient.id)
													? "text-foreground/30 line-through"
													: "text-foreground/70"
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
							<p className="text-foreground/70 text-sm">
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
								<button
									type="button"
									onClick={() => toggleStep(step.stepNumber)}
									className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-border text-sm font-bold${
										checkedSteps.includes(step.stepNumber)
											? "bg-main text-main-foreground"
											: "bg-secondary-background hover:bg-main hover:text-main-foreground"
									}transition-colors`}
								>
									{step.stepNumber}
								</button>
								<div className="flex-1 pt-1">
									<p
										className={`font-base leading-relaxed${
											checkedSteps.includes(step.stepNumber)
												? "text-foreground/50 line-through"
												: ""
										}
											`}
									>
										{step.instruction}
									</p>
									{(step.timeMinutes || step.temperature || step.notes) && (
										<div className="mt-2 space-y-1 text-foreground/70 text-sm">
											{step.timeMinutes && <p>⏱️ {step.timeMinutes} minutes</p>}
											{step.temperature && <p>🌡️ {step.temperature}</p>}
											{step.notes && <p>💡 {step.notes}</p>}
										</div>
									)}
								</div>
							</li>
						))}
					</ol>
				</CardContent>
			</Card>
		</>
	);
}
