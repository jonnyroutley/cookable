import Link from "next/link";
import { Button } from "@/components/ui/button";
import Marquee from "@/components/ui/marquee";
import { HydrateClient } from "@/trpc/server";
import { NewRecipeButton } from "./_components/NewRecipeButton";
import { Dice5, NotebookTabs } from "lucide-react";

export default async function Home() {
	return (
		<HydrateClient>
			<div className="overflow-hidden">
				<Marquee
					items={[
						"Let's eat!", // English
						"🍑",
						"我们吃吧!", // Chinese (Mandarin)
						"🍙",
						"Mangeons!", // French
						"🍜",
						"食べましょう!", // Japanese
						"🍝",
						"Mangiamo!", // Italian
						"🍕",
						"لنأكل!", // Arabic
						"🍔",
						"Vamos a comer!", // Spanish
						"🍖",
						"Lass uns essen!", // German
						"🍟",
						"Vamos comer!", // Portuguese
						"🍣",
						"Давай поедим!", // Russian
						"🥓",
						"चलो खाते हैं!", // Hindi
						"🍳",
						"Hadi yiyelim!", // Turkish
						"🍆",
						"먹자!", // Korean
						"🍰",
						"Ayo makan!", // Indonesian
						"🍛",
						"Laten we eten!", // Dutch
						"🍱",
						"Äta nu!", // Swedish
						"🐟",
					]}
				/>
			</div>
			<main className="flex h-full flex-col items-center justify-between gap-8 p-4 sm:p-12">
				<h1 className="text-center">Welcome to Cookable!</h1>
				<div className="flex flex-col items-center gap-4">
					<div className="flex flex-wrap justify-center gap-4">
						<Link href="/recipe">
							<Button type="button" variant="neutral">
								<NotebookTabs className="size-4" />
								see all recipes
							</Button>
						</Link>
						<Button variant="neutral">
							<Dice5 className="size-4" />
							I'm feeling lucky
						</Button>
						<NewRecipeButton />
					</div>
				</div>
				<div className="w-full max-w-[200px]"></div>
			</main>
		</HydrateClient>
	);
}
