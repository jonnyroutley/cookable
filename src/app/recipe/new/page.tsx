"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChefHat, Clock, Plus, Trash2, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TagSelector, type Tag } from "@/components/ui/tag-selector";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

const ingredientSchema = z.object({
	name: z.string().min(1, "Ingredient name is required"),
	amount: z.string().optional(),
	unit: z.string().optional(),
	notes: z.string().optional(),
	order: z.number().int().min(0),
});

const recipeStepSchema = z.object({
	stepNumber: z.number().int().min(1),
	instruction: z.string().min(1, "Instruction is required"),
});

const createRecipeSchema = z.object({
	title: z.string().min(1, "Title is required").max(255),
	description: z.string().optional(),
	servings: z.number().int().min(1).optional(),
	prepTimeMinutes: z.number().int().min(0).optional(),
	cookTimeMinutes: z.number().int().min(0).optional(),
	difficulty: z.enum(["easy", "medium", "hard"]).optional(),
	// imageUrl: z.string().url().optional().or(z.literal("")),
	ingredients: z
		.array(ingredientSchema)
		.min(1, "At least one ingredient is required"),
	steps: z.array(recipeStepSchema).min(1, "At least one step is required"),
	tagIds: z.array(z.number().int()),
});

type CreateRecipeForm = z.infer<typeof createRecipeSchema>;

export default function NewRecipePage() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
	const utils = api.useUtils();

	// Redirect to login if not authenticated
	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth/signin?callbackUrl=/recipe/new");
		}
	}, [status, router]);

	const defaultValues: CreateRecipeForm = {
		title: "",
		description: "",
		servings: undefined,
		prepTimeMinutes: undefined,
		cookTimeMinutes: undefined,
		difficulty: undefined,
		// imageUrl: "",
		ingredients: [{ name: "", amount: "", unit: "", notes: "", order: 0 }],
		steps: [
			{
				stepNumber: 1,
				instruction: "",
			},
		],
		tagIds: [],
	};

	const form = useForm({
		resolver: zodResolver(createRecipeSchema),
		defaultValues,
	});

	const {
		fields: ingredientFields,
		append: appendIngredient,
		remove: removeIngredient,
	} = useFieldArray({
		control: form.control,
		name: "ingredients",
	});

	const {
		fields: stepFields,
		append: appendStep,
		remove: removeStep,
	} = useFieldArray({
		control: form.control,
		name: "steps",
	});

	// Fetch available tags
	const { data: availableTags = [] } = api.recipe.getTags.useQuery();

	const toggleTag = (tagId: number) => {
		const newTagIds = selectedTagIds.includes(tagId)
			? selectedTagIds.filter((id) => id !== tagId)
			: [...selectedTagIds, tagId];

		setSelectedTagIds(newTagIds);
		form.setValue("tagIds", newTagIds);
	};

	const handleTagCreate = (newTag: Tag) => {
		const newTagIds = [...selectedTagIds, newTag.id];
		setSelectedTagIds(newTagIds);
		form.setValue("tagIds", newTagIds);
		utils.recipe.getTags.invalidate();
	};

	const createRecipe = api.recipe.create.useMutation({
		onSuccess: (recipe) => {
			toast.success("Recipe created successfully!");
			router.push(`/recipe/${recipe.id}`);
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create recipe");
			setIsSubmitting(false);
		},
	});

	const onSubmit = async (data: CreateRecipeForm) => {
		setIsSubmitting(true);
		try {
			// Reorder steps and ingredients
			const processedData = {
				...data,
				ingredients: data.ingredients.map((ingredient, index) => ({
					...ingredient,
					order: index,
				})),
				steps: data.steps.map((step, index) => ({
					...step,
					stepNumber: index + 1,
				})),
			};

			await createRecipe.mutateAsync(processedData);
		} catch (error) {
			// Error handling is done in the mutation callback
		}
	};
	// Show loading while checking authentication
	if (status === "loading") {
		return (
			<div className={cn("container mx-auto max-w-4xl p-4")}>
				<Card className="mb-6">
					<CardHeader>
						<div className="animate-pulse">
							<div className="mb-2 h-8 rounded bg-secondary-background"></div>
							<div className="h-4 w-3/4 rounded bg-secondary-background"></div>
						</div>
					</CardHeader>
				</Card>
			</div>
		);
	}

	// Don't render the form if not authenticated
	if (!session) {
		return null;
	}

	return (
		<div className={cn("container mx-auto max-w-4xl p-4")}>
			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="font-heading text-2xl">
						Create New Recipe
					</CardTitle>
					<CardDescription>
						Share your delicious creation with the world
					</CardDescription>
				</CardHeader>
			</Card>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					{/* Basic Recipe Info */}
					<Card>
						<CardHeader>
							<CardTitle className="font-heading text-xl">
								Recipe Details
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Recipe Title *</FormLabel>
										<FormControl>
											<Input placeholder="My Amazing Recipe" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Input
												placeholder="A brief description of your recipe..."
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* <FormField
								control={form.control}
								name="imageUrl"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Image URL</FormLabel>
										<FormControl>
											<Input
												placeholder="https://example.com/recipe-image.jpg"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/> */}

							<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
								<FormField
									control={form.control}
									name="servings"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												<Users className="mr-1 inline h-4 w-4" />
												Servings
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="4"
													{...field}
													onChange={(e) =>
														field.onChange(
															e.target.value
																? Number.parseInt(e.target.value)
																: undefined,
														)
													}
													value={field.value || ""}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="prepTimeMinutes"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												<Clock className="mr-1 inline h-4 w-4" />
												Prep (min)
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="15"
													{...field}
													onChange={(e) =>
														field.onChange(
															e.target.value
																? Number.parseInt(e.target.value)
																: undefined,
														)
													}
													value={field.value || ""}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="cookTimeMinutes"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												<Clock className="mr-1 inline h-4 w-4" />
												Cook (min)
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="30"
													{...field}
													onChange={(e) =>
														field.onChange(
															e.target.value
																? Number.parseInt(e.target.value)
																: undefined,
														)
													}
													value={field.value || ""}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="difficulty"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												<ChefHat className="mr-1 inline h-4 w-4" />
												Difficulty
											</FormLabel>
											<FormControl>
												<select
													{...field}
													className="flex h-10 w-full rounded-base border-2 border-border bg-secondary-background px-3 py-2 font-base text-foreground text-sm"
												>
													<option value="">Select...</option>
													<option value="easy">Easy</option>
													<option value="medium">Medium</option>
													<option value="hard">Hard</option>
												</select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Tags */}
							<TagSelector
								selectedTagIds={selectedTagIds}
								onTagToggle={toggleTag}
								availableTags={availableTags}
								onTagCreate={handleTagCreate}
							/>
						</CardContent>
					</Card>

					{/* Ingredients */}
					<Card>
						<CardHeader>
							<CardTitle className="font-heading text-xl">
								Ingredients *
							</CardTitle>
							<CardDescription>
								Add all ingredients needed for this recipe
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{ingredientFields.map((field, index) => (
								<div
									key={field.id}
									className="grid grid-cols-1 gap-3 rounded-base border-2 border-border bg-secondary-background p-4 sm:grid-cols-12"
								>
									<FormField
										control={form.control}
										name={`ingredients.${index}.amount`}
										render={({ field }) => (
											<FormItem className="sm:col-span-2">
												<FormLabel className="sr-only">Amount</FormLabel>
												<FormControl>
													<Input placeholder="1" {...field} />
												</FormControl>
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name={`ingredients.${index}.unit`}
										render={({ field }) => (
											<FormItem className="sm:col-span-2">
												<FormLabel className="sr-only">Unit</FormLabel>
												<FormControl>
													<Input placeholder="cup" {...field} />
												</FormControl>
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name={`ingredients.${index}.name`}
										render={({ field }) => (
											<FormItem className="sm:col-span-4">
												<FormLabel className="sr-only">Ingredient</FormLabel>
												<FormControl>
													<Input placeholder="flour" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name={`ingredients.${index}.notes`}
										render={({ field }) => (
											<FormItem className="sm:col-span-3">
												<FormLabel className="sr-only">Notes</FormLabel>
												<FormControl>
													<Input placeholder="optional notes" {...field} />
												</FormControl>
											</FormItem>
										)}
									/>
									<div className="flex justify-end sm:col-span-1">
										{ingredientFields.length > 1 && (
											<Button
												type="button"
												variant="neutral"
												size="icon"
												onClick={() => removeIngredient(index)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										)}
									</div>
								</div>
							))}
							<Button
								type="button"
								variant="neutral"
								onClick={() =>
									appendIngredient({
										name: "",
										amount: "",
										unit: "",
										notes: "",
										order: ingredientFields.length,
									})
								}
								className="w-full"
							>
								<Plus className="mr-2 h-4 w-4" />
								Add Ingredient
							</Button>
							<FormMessage>
								{form.formState.errors.ingredients?.root?.message}
							</FormMessage>
						</CardContent>
					</Card>

					{/* Instructions */}
					<Card>
						<CardHeader>
							<CardTitle className="font-heading text-xl">
								Instructions *
							</CardTitle>
							<CardDescription>
								Step-by-step cooking instructions
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{stepFields.map((field, index) => (
								<div
									key={field.id}
									className="space-y-3 rounded-base border-2 border-border bg-secondary-background p-4"
								>
									<div className="flex items-center gap-3">
										<div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-main font-bold text-main-foreground text-sm">
											{index + 1}
										</div>
										<h4 className="font-heading">Step {index + 1}</h4>
										{stepFields.length > 1 && (
											<Button
												type="button"
												variant="neutral"
												size="icon"
												onClick={() => removeStep(index)}
												className="ml-auto"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										)}
									</div>

									<FormField
										control={form.control}
										name={`steps.${index}.instruction`}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Instruction *</FormLabel>
												<FormControl>
													<Input
														placeholder="Mix ingredients thoroughly..."
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							))}
							<Button
								type="button"
								variant="neutral"
								onClick={() =>
									appendStep({
										stepNumber: stepFields.length + 1,
										instruction: "",
									})
								}
								className="w-full"
							>
								<Plus className="mr-2 h-4 w-4" />
								Add Step
							</Button>
							<FormMessage>
								{form.formState.errors.steps?.root?.message}
							</FormMessage>
						</CardContent>
					</Card>

					{/* Submit */}
					<Card className="mb-12">
						<CardContent className="p-4">
							<div className="flex justify-end gap-4">
								<Button
									type="button"
									variant="neutral"
									onClick={() => router.back()}
									disabled={isSubmitting}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={isSubmitting}
									className="min-w-32"
								>
									{isSubmitting ? "Creating..." : "Create Recipe"}
								</Button>
							</div>
						</CardContent>
					</Card>
				</form>
			</Form>
		</div>
	);
}
