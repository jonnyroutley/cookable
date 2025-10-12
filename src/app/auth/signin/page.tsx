"use client";

import { signIn, getProviders } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useMemo } from "react";
import { Github, LogIn, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const emailSchema = z.object({
	email: z
		.string()
		.min(1, "Email is required")
		.email("Please enter a valid email address")
		.refine(
			(email) => email.endsWith("@healthtech1.uk"),
			"Email must be from @healthtech1.uk domain",
		),
});

type EmailForm = z.infer<typeof emailSchema>;

function SignInContent() {
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") || "/";
	const [providers, setProviders] = useState<any>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<EmailForm>({
		resolver: zodResolver(emailSchema),
		defaultValues: {
			email: "",
		},
	});

	useEffect(() => {
		const fetchProviders = async () => {
			const res = await getProviders();
			setProviders(res);
		};
		fetchProviders();
	}, []);

	const handleOAuthSignIn = (providerId: string) => {
		signIn(providerId, { callbackUrl });
	};

	const handleEmailSignIn = async (data: EmailForm) => {
		setIsSubmitting(true);
		try {
			const result = await signIn("resend", {
				email: data.email,
				callbackUrl,
				redirect: false,
			});

			if (result?.error) {
				toast.error("Failed to send sign-in email. Please try again.");
			} else {
				toast.success("Sign-in email sent! Check your inbox.");
			}
		} catch (error) {
			toast.error("An error occurred. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Separate email providers from OAuth providers
	const { emailProviders, oauthProviders } = useMemo(() => {
		if (!providers) {
			return { emailProviders: [], oauthProviders: [] };
		}

		const allProviders = Object.values(providers);
		const emailProviders = allProviders.filter(
			(provider: any) => provider.id === "resend" || provider.type === "email",
		);
		const oauthProviders = allProviders.filter(
			(provider: any) => provider.id !== "resend" && provider.type !== "email",
		);

		return { emailProviders, oauthProviders };
	}, [providers]);

	if (!providers) {
		return (
			<div className="container mx-auto max-w-md p-4">
				<Card>
					<CardHeader>
						<Skeleton className="h-8 w-32" />
						<Skeleton className="h-4 w-48" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-10 w-full" />
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-md p-4">
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="font-heading text-2xl">
						<LogIn className="mx-auto mb-2 h-8 w-8" />
						Sign In
					</CardTitle>
					<CardDescription>
						Sign in to your account to create and share recipes
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Email Sign In Form */}
					{emailProviders.length > 0 && (
						<div>
							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(handleEmailSignIn)}
									className="space-y-4"
								>
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email Address</FormLabel>
												<FormControl>
													<Input
														type="email"
														placeholder="name@healthtech1.uk"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Button
										type="submit"
										className="w-full"
										size="lg"
										disabled={isSubmitting}
										variant="neutral"
									>
										<Mail className="mr-2 h-4 w-4" />
										{isSubmitting ? "Sending..." : "Send me a magic link 🪄"}
									</Button>
								</form>
							</Form>
						</div>
					)}

					{/* OAuth Providers */}
					{oauthProviders.length > 0 && emailProviders.length > 0 && (
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-card px-2 text-muted-foreground">
									Or continue with
								</span>
							</div>
						</div>
					)}

					{oauthProviders.map((provider: any) => (
						<Button
							key={provider.name}
							onClick={() => handleOAuthSignIn(provider.id)}
							className="w-full"
							size="lg"
							variant="neutral"
						>
							{provider.name === "GitHub" && (
								<Github className="mr-2 h-4 w-4" />
							)}
							Sign in with {provider.name}
						</Button>
					))}

					{callbackUrl !== "/" && (
						<div className="mt-4 text-center text-muted-foreground text-sm">
							You'll be redirected back to your intended page after signing in.
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export default function SignInPage() {
	return (
		<Suspense
			fallback={
				<div className="container mx-auto max-w-md p-4">
					<Card>
						<CardHeader>
							<Skeleton className="h-8 w-32" />
							<Skeleton className="h-4 w-48" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-10 w-full" />
						</CardContent>
					</Card>
				</div>
			}
		>
			<SignInContent />
		</Suspense>
	);
}
