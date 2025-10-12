import { NotebookTabs } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Marquee from "@/components/ui/marquee";
import { HydrateClient } from "@/trpc/server";
import { GuyFieriQuotation } from "./_components/GuyFieriQuotation";
import { LuckyButton } from "./_components/LuckyButton";
import { NewRecipeButton } from "./_components/NewRecipeButton";

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
			<main className="mx-auto flex h-full max-w-2xl flex-col items-center justify-between gap-8 p-4 sm:p-12">
				<h1 className="flex flex-row items-center gap-2 text-center">
					Welcome to Cookable!
				</h1>
				<GuyFieriQuotation />
				<div className="flex flex-col items-center gap-4">
					<div className="flex flex-wrap justify-center gap-4">
						<Link href="/recipe">
							<Button type="button" variant="neutral">
								<NotebookTabs className="size-4" />
								see all recipes
							</Button>
						</Link>
						<LuckyButton />
						<NewRecipeButton />
					</div>
				</div>
				<div className="w-full max-w-[200px]"></div>
			</main>
		</HydrateClient>
	);
}
