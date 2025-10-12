"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export const NewRecipeButton = () => {
	const { data: session } = useSession();

	const href = session
		? "/recipe/new"
		: "/auth/signin?callbackUrl=/recipe/new";

	return (
		<Link href={href}>
			<Button>
				<Plus className="size-4" />
				new recipe
			</Button>
		</Link>
	);
};
