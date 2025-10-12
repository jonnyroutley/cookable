"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
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
	name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
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
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		data: profile,
		isLoading,
		error,
		refetch: refetchProfile,
	} = api.user.getProfile.useQuery(undefined, {
		enabled: !!session?.user,
	});

	const form = useForm<UpdateProfileForm>({
		resolver: zodResolver(updateProfileSchema),
		defaultValues: {
			name: profile?.name || "",
		},
	});

	// Update form when profile data loads
	if (profile && !form.getValues().name) {
		form.reset({
			name: profile.name || "",
		});
	}

	const updateProfile = api.user.updateProfile.useMutation({
		onSuccess: async (updatedUser) => {
			toast.success("Profile updated successfully!");
			setIsSubmitting(false);

			// Update the session with new name
			await updateSession({
				...session,
				user: {
					...session?.user,
					name: updatedUser.name,
				},
			});

			// Refetch profile data
			await refetchProfile();
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
						<p className="">
							You need to be logged in to view your profile.
						</p>
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
						<h2 className="mb-2 font-heading text-xl">Unable to load profile</h2>
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
						Your Profile
					</CardTitle>
					<CardDescription>
						Manage your account settings and personal information
					</CardDescription>
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
											<Input
												placeholder="Enter your display name"
												{...field}
											/>
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
										className="bg-muted"
									/>
									<p className="mt-1 text-muted-foreground text-sm">
										Email cannot be changed
									</p>
								</div>
							</div>

							<div className="flex justify-end">
								<Button
									type="submit"
									disabled={isSubmitting || !form.formState.isDirty}
									className="min-w-24"
								>
									{isSubmitting ? "Saving..." : "Save Changes"}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}