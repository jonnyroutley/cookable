import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export const NewRecipeButton = () => {
	return (
		<Link href="/recipe/new">
			<Button>
				<Plus className="size-4" />
				new recipe
			</Button>
		</Link>
	);
};
