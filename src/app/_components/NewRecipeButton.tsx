"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export const NewRecipeButton = () => {
	const { data: session } = useSession();

	const href = session ? "/recipe/new" : "/auth/signin?callbackUrl=/recipe/new";

	return (
		<Link href={href}>
			<Button>
				<Plus className="size-4" />
				new recipe
			</Button>
		</Link>
	);
};
