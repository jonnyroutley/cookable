import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { HydrateClient, api } from "@/trpc/server";
import { Archivo } from "next/font/google";

const archivo = Archivo({
	subsets: ["latin"],
});

export default async function Home() {
	const hello = await api.post.hello({ text: "from tRPC" });
	const session = await auth();

	if (session?.user) {
		void api.post.getLatest.prefetch();
	}

	return (
		<HydrateClient>
			<div className={cn(archivo.className, "min-h-screen")}>
				<h1 className="p-1 font-bold text-5xl">Cookable</h1>
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
				<main className="p-4">
					<div>
						<Button type="button">+ new recipe</Button>
					</div>
					<div className="flex flex-col items-center justify-center p-6">
						<Card className="flex flex-col items-center justify-center p-6 w-full">
							<h1>Welcome to cookable</h1>
							<Button>I'm feeling lucky</Button>
							<Carousel className="w-full max-w-[200px]">
								<CarouselContent>
									{Array.from({ length: 5 }).map((_, index) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: don't care
										<CarouselItem key={index}>
											<div className="p-[10px]">
												<Card className="bg-main p-0 text-main-foreground shadow-none">
													<CardContent className="flex aspect-square items-center justify-center p-4">
														<span className="font-base text-3xl">
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
						</Card>
					</div>
					<div className="flex w-full flex-col items-center gap-4"></div>
					{/* <div className="text-center text-xs">Made with 💙 in Stratford</div> */}
				</main>
			</div>
			{/* <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
				<div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
					<h1 className="font-extrabold text-5xl tracking-tight sm:text-[5rem]">
						Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
					</h1>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
						<Link
							className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
							href="https://create.t3.gg/en/usage/first-steps"
							target="_blank"
						>
							<h3 className="font-bold text-2xl">First Steps →</h3>
							<div className="text-lg">
								Just the basics - Everything you need to know to set up your
								database and authentication.
							</div>
						</Link>
						<Link
							className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
							href="https://create.t3.gg/en/introduction"
							target="_blank"
						>
							<h3 className="font-bold text-2xl">Documentation →</h3>
							<div className="text-lg">
								Learn more about Create T3 App, the libraries it uses, and how
								to deploy it.
							</div>
						</Link>
					</div>
					<div className="flex flex-col items-center gap-2">
						<p className="text-2xl text-white">
							{hello ? hello.greeting : "Loading tRPC query..."}
						</p>

						<div className="flex flex-col items-center justify-center gap-4">
							<p className="text-center text-2xl text-white">
								{session && <span>Logged in as {session.user?.name}</span>}
							</p>
							<Link
								href={session ? "/api/auth/signout" : "/api/auth/signin"}
								className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
							>
								{session ? "Sign out" : "Sign in"}
							</Link>
						</div>
					</div>

					{session?.user && <LatestPost />}
				</div>
			</main> */}
		</HydrateClient>
	);
}
