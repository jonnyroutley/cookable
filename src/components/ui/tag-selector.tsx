"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";

interface Tag {
	id: number;
	name: string;
	type: string;
	color?: string | null;
}

interface TagSelectorProps {
	selectedTagIds: number[];
	onTagToggle: (tagId: number) => void;
	availableTags: Tag[];
	onTagCreate?: (tag: Tag) => void;
}

const TAG_TYPES = [
	{ value: "cuisine", label: "Cuisine" },
	{ value: "allergen", label: "Allergen" },
	{ value: "dietary", label: "dietary" },
] as const;

const TAG_COLORS = [
	"#ef4444", // red
	"#f97316", // orange
	"#eab308", // yellow
	"#22c55e", // green
	"#3b82f6", // blue
	"#8b5cf6", // violet
	"#ec4899", // pink
	"#64748b", // slate
] as const;

export function TagSelector({
	selectedTagIds,
	onTagToggle,
	availableTags,
	onTagCreate,
}: TagSelectorProps) {
	const [isCreating, setIsCreating] = useState(false);
	const [newTagName, setNewTagName] = useState("");
	const [newTagType, setNewTagType] = useState<
		"cuisine" | "allergen" | "dietary"
	>("dietary");
	const [newTagColor, setNewTagColor] = useState<string>(TAG_COLORS[0]);

	const createTagMutation = api.recipe.createTag.useMutation({
		onSuccess: (newTag) => {
			if (newTag) {
				toast.success(`Tag "${newTag.name}" created successfully!`);
				onTagCreate?.(newTag);
				setIsCreating(false);
				setNewTagName("");
				setNewTagColor(TAG_COLORS[0]);
			}
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create tag");
		},
	});

	const handleCreateTag = () => {
		if (!newTagName.trim()) {
			toast.error("Tag name is required");
			return;
		}

		createTagMutation.mutate({
			name: newTagName.trim(),
			type: newTagType,
			color: newTagColor,
		});
	};

	const handleCancelCreate = () => {
		setIsCreating(false);
		setNewTagName("");
		setNewTagType("dietary");
		setNewTagColor(TAG_COLORS[0]);
	};

	return (
		<div className="space-y-4">
			<div>
				<div className="mb-2 flex items-center justify-between">
					<h3 className="font-heading text-base">Tags</h3>
					<Button
						type="button"
						variant="neutral"
						size="sm"
						onClick={() => setIsCreating(true)}
						disabled={isCreating}
					>
						<Plus className="mr-2 h-3 w-3" />
						Create Tag
					</Button>
				</div>
				<p className="mb-3 text-muted-foreground text-sm">
					Select existing tags or create new ones to help categorize your recipe
				</p>
			</div>

			{/* Create New Tag Form */}
			{isCreating && (
				<div className="space-y-3 rounded-base border-2 border-border bg-secondary-background p-4">
					<h4 className="font-heading text-sm">Create New Tag</h4>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<div>
							<label
								htmlFor="tag-name"
								className="mb-1 block font-medium text-sm"
							>
								Tag Name
							</label>
							<Input
								id="tag-name"
								placeholder="e.g., Italian, Gluten-Free"
								value={newTagName}
								onChange={(e) => setNewTagName(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleCreateTag();
									}
								}}
							/>
						</div>
						<div>
							<label
								htmlFor="tag-category"
								className="mb-1 block font-medium text-sm"
							>
								Category
							</label>
							<select
								id="tag-category"
								value={newTagType}
								onChange={(e) =>
									setNewTagType(
										e.target.value as "cuisine" | "allergen" | "dietary",
									)
								}
								className="flex h-10 w-full rounded-base border-2 border-border bg-secondary-background px-3 py-2 font-base text-foreground text-sm"
							>
								{TAG_TYPES.map((type) => (
									<option key={type.value} value={type.value}>
										{type.label}
									</option>
								))}
							</select>
						</div>
					</div>
					<div>
						{/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
						<label className="mb-1 block font-medium text-sm">Color</label>
						<div className="flex gap-2">
							{TAG_COLORS.map((color) => (
								<button
									key={color}
									type="button"
									className={`h-6 w-6 rounded-full border-2 ${
										newTagColor === color
											? "border-foreground"
											: "border-transparent"
									}`}
									style={{ backgroundColor: color }}
									onClick={() => setNewTagColor(color)}
								/>
							))}
						</div>
					</div>
					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="neutral"
							size="sm"
							onClick={handleCancelCreate}
							disabled={createTagMutation.isPending}
						>
							<X className="mr-1 h-3 w-3" />
							Cancel
						</Button>
						<Button
							type="button"
							size="sm"
							onClick={handleCreateTag}
							disabled={createTagMutation.isPending || !newTagName.trim()}
						>
							<Plus className="mr-1 h-3 w-3" />
							{createTagMutation.isPending ? "Creating..." : "Create"}
						</Button>
					</div>
				</div>
			)}

			{/* Existing Tags */}
			{availableTags.length > 0 && (
				<div>
					<h4 className="mb-2 font-heading text-sm">Available Tags</h4>
					<div className="flex flex-wrap gap-2">
						{availableTags.map((tag) => (
							<Badge
								key={tag.id}
								variant={
									selectedTagIds.includes(tag.id) ? "default" : "neutral"
								}
								className="cursor-pointer select-none transition-colors hover:opacity-80"
								onClick={() => onTagToggle(tag.id)}
								style={
									tag.color
										? {
												backgroundColor: selectedTagIds.includes(tag.id)
													? tag.color
													: undefined,
												borderColor: tag.color,
												color: selectedTagIds.includes(tag.id)
													? "white"
													: tag.color,
											}
										: {}
								}
							>
								{tag.name}
								<span className="ml-1 text-xs opacity-75">({tag.type})</span>
							</Badge>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
