import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import Marquee from "@/components/ui/marquee";
import { cn } from "@/lib/utils";
// import { LatestPost } from "@/app/_components/post";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";

export default async function Home() {
	const _hello = await api.post.hello({ text: "from tRPC" });
	const session = await auth();

	if (session?.user) {
		void api.post.getLatest.prefetch();
	}

	return (
		<HydrateClient>
			<div className={cn("relative min-h-screen")}>
				<h1 className="break-words border-t-2 p-1 font-bold text-3xl hover:underline sm:text-5xl">
					Cookable
				</h1>
				<div className="overflow-hidden">
					<Marquee
						items={[
							"Let's eat", // English
							"🍑",
							"我们吃吧", // Chinese (Mandarin)
							"🍙",
							"Mangeons", // French
							"🍜",
							"食べましょう", // Japanese
							"🍝",
							"Mangiamo", // Italian
							"🍕",
							"لنأكل", // Arabic
							"🍔",
							"Vamos a comer", // Spanish
							"🍖",
							"Lass uns essen", // German
							"🍟",
							"Vamos comer", // Portuguese
							"🍣",
							"Давай поедим", // Russian
							"🥓",
							"चलो खाते हैं", // Hindi
							"🍳",
							"Hadi yiyelim", // Turkish
							"🍆",
							"먹자", // Korean
							"🍰",
							"Ayo makan", // Indonesian
							"🍛",
							"Laten we eten", // Dutch
							"🍱",
							"Äta nu", // Swedish
							"🐟",
						]}
					/>
				</div>
				<main className="flex h-full flex-col items-center justify-between gap-12 p-4 sm:p-12">
					<Card className="w-full max-w-lg">
						<CardHeader>
							<CardTitle className="text-center">
								Welcome to Cookable!
							</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col items-center gap-4">
							<div className="flex flex-wrap justify-center gap-4">
								<Link href="/recipe">
									<Button type="button" variant="neutral">
										see all recipes
									</Button>
								</Link>
								<Button variant="neutral">I'm feeling lucky</Button>
								<Link href="/recipe/new">
									<Button type="button">+ new recipe</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
					<div className="w-full max-w-[200px]">
						<Carousel>
							<CarouselContent>
								{Array.from({ length: 5 }).map((_, index) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: don't care
									<CarouselItem key={index}>
										<div className="p-2">
											<Card className="bg-main p-0 text-main-foreground shadow-none">
												<CardContent className="flex aspect-square items-center justify-center p-4">
													<span className="font-base text-2xl sm:text-3xl">
														{index + 1}
													</span>
												</CardContent>
											</Card>
										</div>
									</CarouselItem>
								))}
							</CarouselContent>
							<CarouselPrevious />
							<CarouselNext />
						</Carousel>
					</div>
				</main>
				<div className="absolute right-0 bottom-0 left-0 border-t-2 bg-white py-2 text-center text-xs">
					Made with 💙 in Stratford
				</div>
			</div>
		</HydrateClient>
	);
}
