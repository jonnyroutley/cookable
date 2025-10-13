import "@/styles/globals.css";

import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import Link from "next/link";
import { SessionProvider } from "next-auth/react";
import Star8 from "@/components/stars/s8";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { TRPCReactProvider } from "@/trpc/react";
import { UserMenu } from "./_components/UserMenu";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
	title: "Cookable",
	description: "Share your recipes!",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const archivo = Archivo({
	subsets: ["latin"],
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${archivo.className}`}>
			<body>
				<TRPCReactProvider>
					<SessionProvider>
						<div className={cn("relative min-h-screen")}>
							<div className="flex w-full items-center justify-between border-black border-y-4 p-4">
								<Star8 className="absolute top-3 left-56 size-8 text-main hover:animate-spin" />
								<Link
									href="/"
									className="w-fit font-bold text-3xl hover:text-main hover:underline sm:text-5xl"
								>
									Cookable
								</Link>
								<UserMenu />
							</div>
							{children}
							<div className="pb-8" />
							<div className="absolute right-0 bottom-0 left-0 border-t-2 bg-white py-2 text-center text-base">
								Made with 💙 in Stratford
							</div>
						</div>
						<SpeedInsights />
						<Analytics />
						<Toaster />
					</SessionProvider>
				</TRPCReactProvider>
			</body>
		</html>
	);
}
