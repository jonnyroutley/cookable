"use client";

import { Dice5 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

interface LuckyButtonProps {
	variant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link"
		| "neutral";
	size?: "default" | "sm" | "lg" | "icon";
	className?: string;
	children?: React.ReactNode;
}

export function LuckyButton({
	variant = "neutral",
	size = "default",
	className,
	children,
}: LuckyButtonProps) {
	const router = useRouter();

	const getRandomRecipe = api.recipe.getRandom.useQuery(undefined, {
		enabled: false,
	});

	const handleLuckyClick = async () => {
		try {
			const result = await getRandomRecipe.refetch();
			if (result.data) {
				router.push(`/recipe/${result.data.id}`);
			}
		} catch (error) {
			toast.error("No recipes found! Try creating one first.");
		}
	};

	return (
		<Button
			type="button"
			variant={variant}
			size={size}
			className={className}
			onClick={handleLuckyClick}
			disabled={getRandomRecipe.isFetching}
		>
			<Dice5 className="size-4" />
			{children ||
				(getRandomRecipe.isFetching
					? "Finding recipe..."
					: "I'm feeling lucky")}
		</Button>
	);
}
