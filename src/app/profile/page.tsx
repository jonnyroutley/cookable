"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
import { api } from "@/trpc/react";

const updateProfileSchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.max(255, "Name must be less than 255 characters"),
});

type UpdateProfileForm = z.infer<typeof updateProfileSchema>;

function ProfileSkeleton() {
	return (
		<div className="container mx-auto max-w-2xl p-4">
			<Card>
				<CardHeader>
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-4 w-64" />
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Skeleton className="h-4 w-16" />
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-4 w-16" />
						<Skeleton className="h-10 w-full" />
					</div>
					<Skeleton className="h-10 w-24" />
				</CardContent>
			</Card>
		</div>
	);
}

export default function ProfilePage() {
	const { data: session, update: updateSession } = useSession();
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const searchParams = useSearchParams();
	const isSetup = searchParams.get("setup") === "true";
	const utils = api.useUtils();

	const {
		data: profile,
		isLoading,
		error,
	} = api.user.getProfile.useQuery(undefined, {
		enabled: !!session?.user,
	});

	const form = useForm<UpdateProfileForm>({
		resolver: zodResolver(updateProfileSchema),
		defaultValues: {
			name: "",
		},
	});

	// Update form when profile data loads
	useEffect(() => {
		if (profile) {
			form.reset({
				name: profile.name || "",
			});
		}
	}, [profile, form]);

	const updateProfile = api.user.updateProfile.useMutation({
		onSuccess: async (updatedUser) => {
			if (isSetup) {
				toast.success("Welcome! Your profile has been set up successfully.");
			} else {
				toast.success("Profile updated successfully!");
			}
			setIsSubmitting(false);

			// Update the session with new name
			await updateSession({
				...session,
				user: {
					...session?.user,
					name: updatedUser.name,
				},
			});

			// Invalidate and refetch profile data
			await utils.user.getProfile.invalidate();

			// If this was setup, redirect to home page
			if (isSetup) {
				setTimeout(() => {
					router.push("/");
				}, 1000);
			}
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update profile");
			setIsSubmitting(false);
		},
	});

	const onSubmit = async (data: UpdateProfileForm) => {
		setIsSubmitting(true);
		try {
			await updateProfile.mutateAsync(data);
		} catch (error) {
			// Error handling is done in the mutation callback
		}
	};

	if (!session?.user) {
		return (
			<div className="container mx-auto max-w-2xl p-4">
				<Card>
					<CardContent className="p-8 text-center">
						<h2 className="mb-2 font-heading text-xl">Please log in</h2>
						<p className="">You need to be logged in to view your profile.</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isLoading) {
		return <ProfileSkeleton />;
	}

	if (error || !profile) {
		return (
			<div className="container mx-auto max-w-2xl p-4">
				<Card>
					<CardContent className="p-8 text-center">
						<h2 className="mb-2 font-heading text-xl">
							Unable to load profile
						</h2>
						<p className="">
							There was an error loading your profile. Please try again later.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-2xl p-4">
			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="font-heading text-2xl">
						<User className="mr-2 inline h-6 w-6" />
						{isSetup ? "Welcome! Set up your profile" : "Your Profile"}
					</CardTitle>
					<CardDescription>
						{isSetup
							? "Please set your display name to continue using the app"
							: "Manage your account settings and personal information"}
					</CardDescription>
					{isSetup && (
						<div className="mt-2 rounded-base border-2 border-yellow-500 bg-yellow-50 p-3">
							<p className="font-medium text-sm text-yellow-800">
								⚠️ You need to set a display name before you can create recipes
								or use other features.
							</p>
						</div>
					)}
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Display Name *</FormLabel>
										<FormControl>
											<Input placeholder="Jacques Pepin" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="space-y-4">
								<div>
									<FormLabel className="font-base">Email</FormLabel>
									<Input
										value={profile.email}
										disabled
										className="bg-muted bg-white"
									/>
								</div>
							</div>

							<div className="flex justify-end">
								<Button
									type="submit"
									disabled={
										isSubmitting || (!isSetup && !form.formState.isDirty)
									}
									className="min-w-24"
									variant="neutral"
								>
									{isSubmitting
										? isSetup
											? "Setting up..."
											: "Saving..."
										: isSetup
											? "Complete Setup"
											: "Save Changes"}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
